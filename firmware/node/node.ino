// ============================================================
// PULSE GRID OS – PATIENT NODE (ESP32-C3)
// ============================================================
#define NODE_ID 1          // Change for each device (1‑255)
#define FREQUENCY 433E6    // 433 MHz (or 865E6 for India)

// Uncomment to use simulated sensors (no hardware needed)
#define SIMULATE_SENSORS

#include <LoRa.h>
#include <Wire.h>
#include <AES.h>
#include <LittleFS.h>
#include <Adafruit_SSD1306.h>
#include <SPI.h>

#ifndef SIMULATE_SENSORS
  #include <MAX30105.h>
  #include <MPU6050.h>
  MAX30105 particleSensor;
  MPU6050 mpu;
#endif

// LoRa pins (Directly matching the numbers printed on your Supermini board)
#define LORA_SCK 8   // The pin labeled '8'
#define LORA_MISO 9  // The pin labeled '9'
#define LORA_MOSI 10 // The pin labeled '10'
#define LORA_SS 3    // The pin labeled '3'
#define LORA_RST 1   // The pin labeled '1'
#define LORA_DIO0 0  // The pin labeled '0'

// Peripherals (Must be valid C3 pins, < 21)
#define BUZZER_PIN 4 
#define LED_PIN    5
#define BUTTON_PIN 2

#define OLED_ADDR 0x3C
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// AES key (must match hub)
byte aesKey[16] = {0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,
                   0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F};
AES128 aes;

unsigned long lastSend = 0;
int sendInterval = 3000;   // active mode

uint8_t tokens = 1;
unsigned long lastRefill = 0;

struct Packet {
  uint8_t nodeId;
  uint8_t statusRegister;
  uint8_t sensorValueA;   // G‑Force * 10
  uint8_t sensorValueB;   // HR zone (upper 4 bits) | SpO2 zone (lower 4 bits)
  uint8_t batteryLevel;
} __attribute__((packed));

// --- Sensor reading (real or simulated) ---
int readHeartRate() {
  #ifdef SIMULATE_SENSORS
    return 70 + random(-5, 6);
  #else
    return 75;
  #endif
}

int readSpO2() {
  #ifdef SIMULATE_SENSORS
    return 95 + random(-2, 3);
  #else
    return 98;
  #endif
}

float readGForce() {
  #ifdef SIMULATE_SENSORS
    return 1.0 + random(0, 40) / 10.0;  // 1.0‑5.0 G
  #else
    int16_t ax, ay, az;
    mpu.getAcceleration(&ax, &ay, &az);
    return sqrt(ax*ax + ay*ay + az*az) / 16384.0;
  #endif
}

int getBatteryPercent() {
  return 85 + random(-5, 6);
}

bool detectMovement() { return true; }

bool detectFall() {
  return (random(100) < 5);  // 5% chance of fall (demo)
}

// --- Packet encoding ---
void encodePacket(Packet &p) {
  p.nodeId = NODE_ID;
  p.statusRegister = 0;
  if (detectFall()) p.statusRegister |= 0x01;
  if (!detectMovement()) p.statusRegister |= 0x02;
  float g = readGForce();
  if (g > 3.0) p.statusRegister |= 0x04;
  if (getBatteryPercent() < 20) p.statusRegister |= 0x08;
  if (detectMovement()) p.statusRegister |= 0x10;
  if (digitalRead(BUTTON_PIN) == LOW) p.statusRegister |= 0x20;

  p.sensorValueA = (uint8_t)(g * 10);
  if (p.sensorValueA > 255) p.sensorValueA = 255;

  int hr = readHeartRate();
  int spo2 = readSpO2();
  uint8_t hrZone = 0, spo2Zone = 0;
  if (hr >= 140) hrZone = 7;
  else if (hr >= 120) hrZone = 6;
  else if (hr >= 100) hrZone = 5;
  else if (hr >= 80) hrZone = 4;
  else if (hr >= 60) hrZone = 3;
  else if (hr >= 40) hrZone = 2;
  else if (hr > 0) hrZone = 1;

  if (spo2 >= 95) spo2Zone = 5;
  else if (spo2 >= 90) spo2Zone = 4;
  else if (spo2 >= 85) spo2Zone = 3;
  else if (spo2 >= 80) spo2Zone = 2;
  else if (spo2 > 0) spo2Zone = 1;

  p.sensorValueB = (hrZone << 4) | spo2Zone;
  p.batteryLevel = getBatteryPercent();
}

// --- Duty cycle token bucket (1% duty) ---
bool canTransmit() {
  unsigned long now = millis();
  if (now - lastRefill > 100000) {
    if (tokens < 1) tokens++;
    lastRefill = now;
  }
  if (tokens > 0) {
    tokens--;
    return true;
  }
  return false;
}

// --- Store & Forward (LittleFS) ---
void savePacketToFlash(Packet &p) {
  File f = LittleFS.open("/log.bin", "a");
  if (f) { f.write((uint8_t*)&p, sizeof(Packet)); f.close(); }
}

int syncBufferedPackets() {
  int count = 0;
  File f = LittleFS.open("/log.bin", "r");
  if (f) {
    Packet p;
    while (f.readBytes((char*)&p, sizeof(Packet)) > 0) {
      LoRa.beginPacket();
      LoRa.write((uint8_t*)&p, sizeof(Packet));
      LoRa.endPacket();
      count++;
      delay(100);
    }
    f.close();
    LittleFS.remove("/log.bin");
  }
  return count;
}

// --- Downlink handler (ACK from Hub) ---
void handleDownlink() {
  if (LoRa.parsePacket()) {
    String cmd = LoRa.readString();
    Serial.print("RX <- Downlink: ");
    Serial.println(cmd);
    if (cmd.startsWith("ACK_NODE_")) {
      int id = cmd.substring(9).toInt();
      if (id == NODE_ID) {
        digitalWrite(LED_PIN, HIGH);
        tone(BUZZER_PIN, 1000, 500);
        delay(500);
        tone(BUZZER_PIN, 1500, 500);
        delay(500);
        tone(BUZZER_PIN, 2000, 500);
        digitalWrite(LED_PIN, LOW);
      }
    }
  }
}

// --- OLED display ---
void updateDisplay(int hr, int spo2, float g, int batt) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("NODE #"); display.println(NODE_ID);
  display.print("HR: "); display.print(hr); display.println(" BPM");
  display.print("SpO2: "); display.print(spo2); display.println("%");
  display.print("G: "); display.print(g, 1); display.println("G");
  display.print("Bat: "); display.print(batt); display.println("%");
  display.display();
}

void setup() {
  Serial.begin(115200);
  delay(2000); 
  Serial.println("\n\n===========================");
  Serial.println("   ESP32-C3 NODE BOOTING   ");
  Serial.println("===========================\n");

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  Wire.begin(6, 7); // SDA is pin 6, SCL is pin 7
  if(!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) Serial.println("OLED fail");
  else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Starting Node...");
    display.display();
  }

  #ifndef SIMULATE_SENSORS
    particleSensor.begin(Wire, I2C_SPEED_FAST);
    particleSensor.setup();
    mpu.initialize();
  #endif

  LittleFS.begin();

  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(FREQUENCY)) {
    Serial.println("LoRa failed!"); while (1);
  }
  LoRa.setSpreadingFactor(12);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(8);
  LoRa.setTxPower(20);

  aes.setKey(aesKey, 16);
}

void loop() {
  unsigned long now = millis();

  if (detectFall()) sendInterval = 1000;
  else if (detectMovement()) sendInterval = 3000;
  else sendInterval = 15000;

  if (digitalRead(BUTTON_PIN) == LOW) sendInterval = 1000;

  if (now - lastSend >= sendInterval) {
    lastSend = now;

    int hr = readHeartRate();
    int spo2 = readSpO2();
    float g = readGForce();
    int batt = getBatteryPercent();
    updateDisplay(hr, spo2, g, batt);

    Packet p;
    encodePacket(p);

    aes.encryptBlock((uint8_t*)&p, (uint8_t*)&p);

    if (canTransmit()) {
      LoRa.beginPacket();
      LoRa.write((uint8_t*)&p, sizeof(Packet));
      LoRa.endPacket();
      Serial.printf("TX -> HR:%d SpO2:%d G:%.1f Batt:%d%%\n", hr, spo2, g, batt);
    } else {
      savePacketToFlash(p);
      Serial.println("TX -> Saved to flash (Rate limit)");
    }
  }

  handleDownlink();

  if (LittleFS.exists("/log.bin") && detectMovement()) {
    int synced = syncBufferedPackets();
    if (synced) Serial.printf("Synced %d packets\n", synced);
  }

  delay(10);
}
