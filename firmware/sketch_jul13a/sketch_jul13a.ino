// Define the LED pin. Most ESP32 boards have a built-in LED on GPIO 2
#define LED_PIN 2

void setup() {
  // Initialize the digital pin as an output
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // Turn the LED on
  delay(1000);                  // Wait for a second (1000 milliseconds)
  
  digitalWrite(LED_PIN, LOW);    // Turn the LED off
  delay(1000);                  // Wait for a second
}
