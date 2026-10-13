import os
import base64
import re
import threading
import time
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
import serial
from serial.tools import list_ports

load_dotenv()

APP_NAME = "SmartSort API"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()
SERIAL_PORT = os.getenv("SERIAL_PORT", "AUTO").strip()
SERIAL_BAUD = int(os.getenv("SERIAL_BAUD", "9600"))
MIN_CONFIDENCE = float(os.getenv("MIN_CONFIDENCE", "0.70"))

app = FastAPI(title=APP_NAME, version="1.0.0")

# For local development. Restrict this to your deployed frontend domain before deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
serial_lock = threading.Lock()
arduino: Optional[serial.Serial] = None
arduino_port: Optional[str] = None
last_arduino_seen = 0.0
last_scan = None

CATEGORIES = {"paper", "plastic", "organic"}
CATEGORY_TO_COMMAND = {"paper": "PAPER", "plastic": "PLASTIC", "organic": "ORGANIC"}


class ScanRequest(BaseModel):
    image: str = Field(..., description="Base64 image data, optionally prefixed with a data URL")
    mime_type: str = "image/jpeg"


class SortRequest(BaseModel):
    category: str


def decode_image(value: str) -> bytes:
    # Accept either raw base64 or data:image/jpeg;base64,...
    if "," in value and value.strip().lower().startswith("data:"):
        value = value.split(",", 1)[1]
    try:
        return base64.b64decode(value, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Image must be valid base64 data.") from exc


def parse_jsonish(text: str) -> dict:
    # The prompt requests JSON; strip common Markdown fences if the model adds them.
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        result = json.loads(cleaned)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI returned an unreadable result. Please scan again.") from exc
    return result


def find_arduino() -> bool:
    """Connect only when the board sends the real SMARTSORT_READY serial handshake."""
    global arduino, arduino_port, last_arduino_seen
    with serial_lock:
        if arduino is not None and arduino.is_open:
            # A recently received heartbeat confirms the board is alive.
            try:
                if time.time() - last_arduino_seen < 8:
                    return True
                arduino.write(b"STATUS\n")
                deadline = time.time() + 1.2
                while time.time() < deadline:
                    line = arduino.readline().decode("utf-8", errors="ignore").strip()
                    if line == "SMARTSORT_READY":
                        last_arduino_seen = time.time()
                        return True
                arduino.close()
            except Exception:
                try:
                    arduino.close()
                except Exception:
                    pass
            arduino = None
            arduino_port = None

        if SERIAL_PORT.upper() == "AUTO":
            candidates = [p.device for p in list_ports.comports()]
        else:
            candidates = [SERIAL_PORT]

        for port in candidates:
            candidate = None
            try:
                candidate = serial.Serial(port, SERIAL_BAUD, timeout=0.25, write_timeout=1)
                # Opening a typical Arduino USB serial port resets the board.
                time.sleep(2.0)
                candidate.reset_input_buffer()
                candidate.write(b"STATUS\n")
                deadline = time.time() + 3.0
                while time.time() < deadline:
                    line = candidate.readline().decode("utf-8", errors="ignore").strip()
                    if line == "SMARTSORT_READY":
                        arduino = candidate
                        arduino_port = port
                        last_arduino_seen = time.time()
                        return True
                candidate.close()
            except Exception:
                if candidate:
                    try:
                        candidate.close()
                    except Exception:
                        pass
        return False


@app.get("/")
def root():
    return {"name": APP_NAME, "status": "running", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"ok": True, "service": APP_NAME}


@app.get("/api/status")
def status():
    connected = find_arduino()
    return {
        "api": "online",
        "ai_configured": bool(GROQ_API_KEY),
        "arduino_connected": connected,
        "arduino_port": arduino_port if connected else None,
        "servo_ready": connected,
        "mode": "hardware" if connected else "camera-and-AI-only",
    }


@app.post("/api/scan")
def scan(request: ScanRequest):
    global last_scan
    if not client:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is missing. Add it to the project .env file and restart the server.")

    image_bytes = decode_image(request.image)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The image is empty.")

    prompt = """
You are the visual classifier for a waste-segregation prototype in India.
Classify the MAIN waste item clearly visible in the image into exactly one category:
- paper: paper, newspaper, cardboard, paper packaging
- plastic: plastic bottle, wrapper, cup, container, or other plastic waste
- organic: vegetarian fruit/vegetable scraps and other clearly plant-based food waste

Do not classify people, hands, backgrounds, or the camera frame. If there is no clear waste item,
or it is not reasonably classifiable into one of these categories, return category "unknown".
Do not guess. Confidence must be a number from 0 to 1 and should reflect visual certainty.
Return ONLY valid JSON in this exact shape:
{"category":"paper|plastic|organic|unknown","confidence":0.0,"item":"short item description","reason":"brief reason"}
"""
    try:
        image_mime_type = request.mime_type or "image/jpeg"
        if "," in request.image and request.image.strip().lower().startswith("data:"):
            data_header = request.image.split(",", 1)[0]
            match = re.fullmatch(r"data:(image/[a-zA-Z0-9.+-]+);base64", data_header.strip(), re.IGNORECASE)
            if match:
                image_mime_type = match.group(1).lower()
        if image_mime_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
            raise HTTPException(status_code=400, detail="Image must be JPEG, PNG, WebP, or GIF.")

        image_data_url = (
            f"data:{image_mime_type};base64,"
            f"{base64.b64encode(image_bytes).decode('ascii')}"
        )
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data_url}},
                ],
            }],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_completion_tokens=512,
        )
        response_text = response.choices[0].message.content or ""
        parsed = parse_jsonish(response_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq classification failed: {str(exc)}") from exc

    category = str(parsed.get("category", "unknown")).strip().lower()
    try:
        confidence = float(parsed.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))
    item = str(parsed.get("item", "Unidentified item"))[:120]
    reason = str(parsed.get("reason", ""))[:240]

    if category not in CATEGORIES:
        category = "unknown"
    accepted = category in CATEGORIES and confidence >= MIN_CONFIDENCE
    result = {
        "category": category,
        "confidence": round(confidence, 3),
        "confidence_percent": round(confidence * 100, 1),
        "item": item,
        "reason": reason,
        "accepted": accepted,
        "threshold": MIN_CONFIDENCE,
        "arduino_connected": find_arduino(),
        "message": (
            f"Classified as {category.title()}."
            if accepted else
            "Not confident enough to sort. Reposition the item and scan again."
        ),
    }
    last_scan = result
    return result


@app.post("/api/sort")
def sort_waste(request: SortRequest):
    category = request.category.strip().lower()
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Category must be paper, plastic, or organic.")

    if not find_arduino():
        raise HTTPException(
            status_code=409,
            detail="Arduino is not connected. The AI result is available, but no motor command was sent."
        )

    command = CATEGORY_TO_COMMAND[category]
    with serial_lock:
        try:
            arduino.write((command + "\n").encode("utf-8"))
            arduino.flush()
        except Exception as exc:
            raise HTTPException(status_code=503, detail="Arduino connection was lost. Reconnect the board and try again.") from exc

    return {"sent": True, "category": category, "command": command, "arduino_connected": True}


@app.get("/api/last-result")
def get_last_result():
    return {"result": last_scan}
