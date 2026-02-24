# Buoy Conditions Website

A web application built with React and Flask that displays real-time buoy conditions from NOAA stations across North America, Hawaii, and the Caribbean.

**[Live Website](https://buoydata.net)**

## Features

- Real-time buoy data from NOAA's National Data Buoy Center
- Interactive map view of buoy locations
- 45-day historical charts for average wave height, maximum air and water temperatures
- Client-side caching with smart data merging

## Tech Stack

**Frontend:** React, React Router, MapLibre GL, Recharts  
**Backend:** Python, Flask

## Project Structure

```
├── public/                 # Static assets
├── server/                 
│   ├── utils/              # NOAA data processing utilities
│   └── app.py              # Flask API routes
├── src/
│   ├── constants/          # Station list 
│   ├── pages/              # Page components
│   │   ├── Dashboard/      # Main dashboard with buoy cards
│   │   └── Buoy_Map/       # Interactive map view
│   ├── shared/             # Shared components, hooks, utilities
│   └── App.js              # Main app component
```

## Local Development

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Set up Python backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Application

1. Start the Flask backend:
```bash
cd server
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. In a new terminal, start the React frontend:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Deployment

Deployed on DigitalOcean App Platform with separate services for frontend (static site) and backend (web service).
