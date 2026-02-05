# SquirrlTab Backend Server

A lightweight FastAPI backend for tab synchronization and AI-powered categorization.

## Features
- **Sync**: Persistent tab lists stored in SQLite.
- **AI Categorization**: Simple API to categorize tabs and find duplicates using OpenAI.
- **Docker Ready**: Includes `Dockerfile` and `docker-compose.yml`.

## Quick Start (Local)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set your environment variables (create a `.env` file):
   ```env
   OPENAI_API_KEY=your_key_here
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The server will be available at `http://localhost:8000`.

## Quick Start (Docker)
1. Set your `OPENAI_API_KEY` in `.env`.
2. Run:
   ```bash
   docker-compose up -d
   ```

## Development Contract
For details on the API endpoints and request/response formats, please see the [API Contract](../.gemini/antigravity/brain/39ddb5b8-89ab-4527-b899-f5eeda2f25e8/api_contract.md) (or refer to the `api_contract.md` in your artifacts).
