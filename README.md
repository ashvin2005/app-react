# Shift Booking Application

A full-stack application for managing shift bookings, built with FastAPI and React.

## Features

- Shift management (create, book, cancel)
- Real-time availability
- User-friendly interface
- RESTful API

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18.17+
- npm

### Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Node.js dependencies:
   ```bash
   npm install
   ```
5. Create a `.env` file with:
   ```
   RENDER=false
   PORT=8000
   NODE_ENV=development
   ```

### Running Locally

1. Start the backend server:
   ```bash
   uvicorn app:app --reload
   ```
2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Deployment

### Deploying to Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - Environment: Python
   - Build Command:
     ```bash
     pip install -r requirements.txt && npm install && npm run build
     ```
   - Start Command:
     ```bash
     uvicorn app:app --host 0.0.0.0 --port $PORT
     ```
4. Add environment variables:
   - `RENDER=true`
   - `PYTHON_VERSION=3.11.0`
   - `NODE_VERSION=18.17.0`

The application will be automatically deployed when you push to your main branch.

## API Documentation

The API documentation is available at:
- Production: `/api/docs`
- Development: `/docs`

## License

MIT

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