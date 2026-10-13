#include <Servo.h>

// SmartSort: Arduino only moves the servo after a command from the Python backend.
// Serial protocol: STATUS -> SMARTSORT_READY; PAPER / PLASTIC / ORGANIC -> move flap.

Servo sortingServo;

const int SERVO_PIN = 9;
const int PAPER_ANGLE = 30;
const int PLASTIC_ANGLE = 90;
const int ORGANIC_ANGLE = 150;
const int REST_ANGLE = 90;

unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 2000;

void sendReady() {
  Serial.println("SMARTSORT_READY");
}

void moveToCategory(const char* category, int angle) {
  sortingServo.write(angle);
  Serial.print("SORTED:");
  Serial.println(category);
  delay(900);                  // allow the flap to move; adjust to your mechanism
  sortingServo.write(REST_ANGLE);
  Serial.println("SERVO_HOME");
}

void setup() {
  Serial.begin(9600);
  sortingServo.attach(SERVO_PIN);
  sortingServo.write(REST_ANGLE);
  delay(500);
  sendReady();
}

void loop() {
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendReady();
    lastHeartbeat = millis();
  }

  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();

    if (command == "STATUS") {
      sendReady();
    } else if (command == "PAPER") {
      moveToCategory("PAPER", PAPER_ANGLE);
    } else if (command == "PLASTIC") {
      moveToCategory("PLASTIC", PLASTIC_ANGLE);
    } else if (command == "ORGANIC") {
      moveToCategory("ORGANIC", ORGANIC_ANGLE);
    } else {
      Serial.print("UNKNOWN_COMMAND:");
      Serial.println(command);
    }
  }
}
