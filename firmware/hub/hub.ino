// ============================================================
// PULSE GRID OS – GATEWAY HUB (ESP32-S3)
// ============================================================
#define FREQUENCY 433E6
#define WIFI_ENABLED // Comment out for fully offline (no dashboard)

#include <AES.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <LoRa.h>
#include <Wire.h>

#ifdef WIFI_ENABLED
#include <WebSocketsServer.h>
#include <WiFi.h>
const char *ssid = "PulseGrid_Tactical_Hub";
WebSocketsServer webSocket(81);
#endif

// LoRa custom soldered pins (Directly matching the numbers printed on your Supermini board)
#define LORA_SCK 8   // The pin labeled '8'
#define LORA_MISO 9  // The pin labeled '9'
#define LORA_MOSI 10 // The pin labeled '10'
#define LORA_SS 3    // The pin labeled '3'
#define LORA_RST 1   // The pin labeled '1'
#define LORA_DIO0 0  // The pin labeled '0'
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(128, 64, &Wire, -1);

byte aesKey[16] = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                   0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F};
AES128 aes;

int nodeCount = 0;
int lastRSSI = 0;

struct NodeInfo {
  uint8_t id;
  unsigned long lastSeen;
  int rssi;
} nodes[50];

int hrZoneToBPM(uint8_t zone) {
  switch (zone) {
  case 1:
    return 40;
  case 2:
    return 50;
  case 3:
    return 70;
  case 4:
    return 90;
  case 5:
    return 110;
  case 6:
    return 130;
  case 7:
    return 150;
  default:
    return 0;
  }
}

int spo2ZoneToPercent(uint8_t zone) {
  switch (zone) {
  case 1:
    return 80;
  case 2:
    return 83;
  case 3:
    return 88;
  case 4:
    return 92;
  case 5:
    return 98;
  default:
    return 0;
  }
}

void updateNode(uint8_t nodeId, int rssi) {
  int idx = -1;
  for (int i = 0; i < nodeCount; i++) {
    if (nodes[i].id == nodeId) {
      idx = i;
      break;
    }
  }
  if (idx == -1 && nodeCount < 50)
    idx = nodeCount++;
  if (idx != -1) {
    nodes[idx].id = nodeId;
    nodes[idx].lastSeen = millis();
    nodes[idx].rssi = rssi;
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("\n\n===========================");
  Serial.println("    ESP32-C3 HUB BOOTING   ");
  Serial.println("===========================\n");

  Wire.begin(6, 7); // SDA is pin 6, SCL is pin 7
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR))
    Serial.println("OLED fail");

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(FREQUENCY)) {
    Serial.println("LoRa failed!");
    while (1)
      ;
  }
  LoRa.setSpreadingFactor(12);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(8);

#ifdef WIFI_ENABLED
  WiFi.softAP(ssid);
  webSocket.begin();
  webSocket.onEvent(
      [](uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
        if (type == WStype_TEXT) {
          String cmd = String((char *)payload);
          if (cmd.startsWith("ASSIGN_RESCUE")) {
            int target = cmd.substring(14).toInt();
            LoRa.beginPacket();
            LoRa.print("ACK_NODE_" + String(target));
            LoRa.endPacket();
            Serial.printf("TX -> Downlink to Node %d\n", target);
          }
        }
      });
#endif

  aes.setKey(aesKey, 16);
  memset(nodes, 0, sizeof(nodes));
}

void loop() {
#ifdef WIFI_ENABLED
  webSocket.loop();
#endif

  if (LoRa.parsePacket()) {
    lastRSSI = LoRa.packetRssi();

    uint8_t encrypted[5];
    LoRa.readBytes(encrypted, 5);
    aes.decryptBlock(encrypted, encrypted);

    uint8_t nodeId = encrypted[0];
    uint8_t status = encrypted[1];
    float gForce = encrypted[2] / 10.0;
    uint8_t hrZone = (encrypted[3] & 0xF0) >> 4;
    uint8_t spo2Zone = encrypted[3] & 0x0F;
    uint8_t battery = encrypted[4];

    updateNode(nodeId, lastRSSI);
    Serial.printf("RX <- Node %d | RSSI: %d | HR: %d | SpO2: %d | G: %.1f | Batt: %d%%\n", 
                  nodeId, lastRSSI, hrZoneToBPM(hrZone), spo2ZoneToPercent(spo2Zone), gForce, battery);

#ifdef WIFI_ENABLED
    StaticJsonDocument<256> doc;
    doc["id"] = nodeId;
    doc["hr"] = hrZoneToBPM(hrZone);
    doc["spo2"] = spo2ZoneToPercent(spo2Zone);
    doc["gForce"] = gForce;
    doc["battery"] = battery;
    doc["flags"] = status;
    doc["rssi"] = lastRSSI;
    doc["lat"] = random(-100, 100);
    doc["lng"] = random(-100, 100);
    doc["lastUpdate"] = millis();

    StaticJsonDocument<512> env;
    env["type"] = "telemetry_update";
    JsonArray arr = env.createNestedArray("nodes");
    arr.add(doc);
    String json;
    serializeJson(env, json);
    webSocket.broadcastTXT(json);
#endif
  }

  static unsigned long lastDisplay = 0;
  if (millis() - lastDisplay > 1000) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.print("Hub Nodes: ");
    display.println(nodeCount);
    display.print("RSSI: ");
    display.println(lastRSSI);
    display.display();
    lastDisplay = millis();
  }
}