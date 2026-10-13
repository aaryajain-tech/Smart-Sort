# SmartSort

AI-based smart waste segregation prototype for paper, plastic, and organic waste.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Python + FastAPI
- AI: Groq vision API
- Hardware: Arduino + servo motor

## Prerequisites

- Node.js 18+
- Python 3.10+
- A valid Groq API key in the project root `.env` file

## Local setup

1. Create and activate a virtual environment:
   `python -m venv .venv`
   `./.venv/Scripts/Activate.ps1` (PowerShell)

2. Install Python dependencies:
   `pip install -r requirements.txt`

3. Install frontend dependencies:
   `npm install`

4. Add your API key to `.env`:
   `GROQ_API_KEY=your_key_here`
   `GROQ_MODEL=qwen/qwen3.8-27b`

5. Run the app:
   `npm run dev`

This starts both the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://127.0.0.1:3000`.

## Notes

- `npm run dev` starts the backend and frontend together. If you created `.venv`, the launcher uses its Python interpreter; otherwise, it uses `python` from PATH.
- The Arduino board must be connected for physical sorting. Keep Arduino IDE's Serial Monitor closed while the backend is running so it can access the board's serial port.
- The Groq vision model accepts image input and JSON-formatted classification responses.
- Do not share your Groq API key. If it has been exposed, revoke it and create a replacement in Groq Console.
- Do not modify the `.env` file unless you are setting your local API key; it is the backend configuration source.
