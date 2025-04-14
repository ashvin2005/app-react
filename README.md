# Shift Booking API

A FastAPI-based backend for managing shift bookings.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### GET /shifts
Returns all shifts

### GET /shifts/{id}
Returns a single shift by ID

### POST /shifts/{id}/book
Books a shift by ID. Returns 400 if:
- Shift is already booked
- Shift has already started
- Shift overlaps with another booked shift

### POST /shifts/{id}/cancel
Cancels a shift by ID. Returns 400 if:
- Shift is not booked

## Data Model

```json
{
    "id": "UUID",
    "area": "String (Helsinki, Tampere, Turku)",
    "booked": "Boolean",
    "startTime": "Integer (Unix epoch timestamp)",
    "endTime": "Integer (Unix epoch timestamp)"
}
``` 