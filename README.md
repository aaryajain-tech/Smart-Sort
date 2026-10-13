# ♻️ SmartSort — AI-Based Smart Waste Segregator

SmartSort is a working prototype that classifies selected waste items as **paper**, **plastic**, or **organic** using a camera and Groq vision AI. After reviewing an accepted result, the user can send a command to an Arduino to move a servo-controlled flap.

> This project uses a hosted vision model through the Groq API. It does not train a local TensorFlow model or use OpenCV.

---

# 1. How the system works

```text
Real waste item
      ↓
Browser camera or uploaded photo
      ↓
React dashboard
      ↓
FastAPI backend
      ↓
Groq vision classification
      ↓
Category + confidence + explanation
      ↓
User presses the sort button
      ↓
Python sends PAPER / PLASTIC / ORGANIC over USB serial
      ↓
Arduino moves the servo flap
```

The motor does **not** move automatically after classification. A result must be accepted by the confidence threshold, and the user must press the sort button.

---

# 2. Waste categories

The prototype classifies:

| Category | Examples |
| --- | --- |
| 📄 Paper | Paper sheets, newspaper, cardboard, paper packaging |
| 🧴 Plastic | Plastic bottles, wrappers, cups, containers |
| 🍌 Organic | Fruit and vegetable scraps, plant-based food waste |

Items outside these categories, unclear images, and other materials should be returned as unknown or rejected rather than deliberately sorted.

---

# 3. Project components

## Software

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI, Uvicorn
- **Vision AI:** Groq API with a vision-capable model
- **Arduino communication:** PySerial over USB

## Hardware

- Arduino Uno or compatible board
- Servo motor connected to digital pin 9
- USB cable for Arduino-to-computer communication
- Camera available to the browser (built-in or USB webcam)
- Cardboard or other lightweight flap/bin structure

The Arduino is required for physical sorting. The camera and AI can classify independently, but a real sort command requires the board and servo to be connected.

---

# 4. Requirements

- Node.js and npm
- Python 3.10 or newer
- Arduino IDE
- A Groq API key
- Arduino board, servo, and camera for a physical demonstration

---

# 5. Install and configure

Open a terminal in the project directory:

```powershell
cd "E:\My Documents\Downloads\SmartSort_Backend_Starter"
```

Create a Python virtual environment and install the backend requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Install the frontend packages:

```powershell
npm install
```

Create or edit the project-root `.env` file with your own Groq credentials:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b

SERIAL_PORT=AUTO
SERIAL_BAUD=9600
MIN_CONFIDENCE=0.70
```

Never commit `.env` or share your API key. The repository's `.gitignore` is configured to ignore environment files. If a key is exposed, revoke it in Groq Console and create a new one.

---

# 6. Upload the Arduino sketch

The sketch is located at:

```text
arduino/SmartSort_Arduino.ino
```

For Arduino IDE, the sketch's folder and `.ino` filename should both be `SmartSort_Arduino`. If necessary, open the file in Arduino IDE and save/copy it as:

```text
SmartSort_Arduino/
└── SmartSort_Arduino.ino
```

Then:

1. Select **Arduino Uno** under **Tools → Board**.
2. Select the Arduino's COM port under **Tools → Port**.
3. Upload the sketch.
4. Close Arduino IDE's Serial Monitor before running the Python backend; both programs cannot use the same serial port at once.

The Python backend checks for the Arduino's `SMARTSORT_READY` handshake at **9600 baud**.

---

# 7. Servo angles and mechanism

The current sketch defines:

```text
Paper    → 30°
Plastic  → 90°
Organic  → 150°
Rest     → 90°
```

**Important:** Plastic is currently set to the same angle as the rest position, so it will not move to a visibly different position. These values are example positions, not guaranteed positions for every flap. Adjust the category and rest angles to match your servo mounting and bin layout.

Before connecting the flap or placing waste in the bins, test the servo with the linkage clear and adjust its angles in small steps. Avoid forcing the servo against a hard stop. Use an appropriate external servo power supply if required by the motor, and connect its ground to Arduino ground.

---

# 8. Run the application

From the project directory:

```powershell
npm run dev
```

The launcher starts both services:

- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000`
- API documentation: `http://127.0.0.1:8000/docs`

Keep the terminal open while using the app. Press **Ctrl+C** to stop the services. The launcher uses `.venv`'s Python when it exists; otherwise, it looks for `python` on your PATH.

---

# 9. Use the dashboard

1. Connect the Arduino by USB and make sure Arduino IDE's Serial Monitor is closed.
2. Open `http://localhost:3000`.
3. Allow camera access, or upload a real photo of one waste item.
4. Scan the item and review the predicted category, confidence, and explanation.
5. If the result is accepted and the Arduino is connected, press the sort button to move the flap.

The browser generally permits camera access on `localhost`. If camera access is denied, check browser permissions or use the photo upload control.

---

# 10. Classification and safety behavior

The backend asks the vision model to identify one visible item and return structured JSON. The confidence threshold defaults to **0.70** and can be changed with `MIN_CONFIDENCE`.

```text
Confidence meets threshold
        ↓
Result is accepted
        ↓
User may request a physical sort

Confidence below threshold or unknown item
        ↓
Sorting remains unavailable
```

AI results can be wrong. Verify the physical mechanism, supervise demonstrations, and do not use this prototype for hazardous, sharp, hot, medical, or otherwise unsafe waste.

---

# 11. Arduino serial commands

The backend and sketch use this line-based serial protocol:

| Command from backend | Arduino action |
| --- | --- |
| `STATUS` | Reply `SMARTSORT_READY` |
| `PAPER` | Move to paper angle, then return to rest |
| `PLASTIC` | Move to plastic angle, then return to rest |
| `ORGANIC` | Move to organic angle, then return to rest |

The Arduino does not perform AI classification. It only responds to commands sent by the Python backend.

---

# 12. Troubleshooting

### Backend does not start

- Confirm `pip install -r requirements.txt` completed successfully.
- Make sure the project's `.venv` exists or Python is available on PATH.
- Check that ports 8000 and 3000 are not already in use.

### Scan fails

- Confirm `GROQ_API_KEY` is valid in the project-root `.env`.
- Confirm the selected `GROQ_MODEL` is available to your Groq account and supports vision.
- Restart `npm run dev` after changing `.env`.
- Read the error displayed in the dashboard and the backend terminal.

### Arduino is not detected

- Check the USB cable and selected COM port.
- Ensure the sketch is uploaded and uses 9600 baud.
- Close Arduino IDE's Serial Monitor and any other program using the COM port.
- Set `SERIAL_PORT` to `AUTO`, or specify the board's port (for example, `COM8`).

### Servo does not move

- Confirm the dashboard reports Arduino connected and the result is accepted.
- Make sure you pressed the sort button.
- Check signal wiring to pin 9, servo power, and common ground.
- Ensure the target angle differs from `REST_ANGLE`; the current plastic and rest angles are both 90°.
- Test with the flap linkage disconnected, then tune safe angles for your mechanism.

---

# 13. Suggested responsibilities for a five-person team

- **AI and classification:** Prompt, model selection, output quality, and test examples.
- **Frontend and camera:** Dashboard, camera access, upload, and result display.
- **Backend integration:** FastAPI endpoints, Groq API, validation, and error handling.
- **Hardware:** Arduino sketch, servo, wiring, flap, and bins.
- **Testing and presentation:** End-to-end tests, limitations, demonstration, and documentation.

Everyone should understand the full flow from camera capture to the physical flap movement.

---

# 14. Demonstration checklist

1. Verify `/api/status` reports the API online, Groq configured, and Arduino connected.
2. Scan a clearly visible paper item and inspect the result.
3. Press the sort button and confirm the flap moves to the paper bin.
4. Repeat with a plastic item and a plant-based organic item.
5. Show an unclear or unsupported item and confirm it is not automatically actuated.

The project is a prototype. Classification quality, API access, camera conditions, servo calibration, and mechanical alignment all affect the demonstration.
