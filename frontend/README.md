# MyPopVault Frontend

Welcome to the frontend application for **MyPopVault** - the ultimate collection tracker, trading system, and community chat for Funko Pop collectors.

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **WebSockets**: Socket.io-client

## Running Locally

1. Navigate to this directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Production Docker Build

This frontend is designed to be built using a multi-stage Dockerfile and orchestrated via Docker Compose.
To run the full stack (Frontend + Backend), navigate to the root directory of the workspace and run:
```bash
docker compose up --build
```
This serves the application on `http://localhost:8080`.
