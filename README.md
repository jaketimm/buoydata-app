# Buoy Conditions Website

A React application with a Python/Flask backend that displays North American buoy data provided by NDBC/NOAA.

## Project Structure

```
Project
├── public/                 # Static assets
├── server/                 
│   ├── utils/              # NOAA data processing utilities
│   └── app.py              # Flask Routes
├── src/
│   ├── constants/          # Station List
│   ├── pages/              # Page components
│   │   ├── Dashboard/      # Dashboard page and assets
│   │   └── Buoy_Map/       # Map page and assets
│   ├── shared/             # Shared components, hooks, utility functions
│   └── App.js              # Main app component
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Installation

1. Clone the repository

2. Install main dependencies:

```bash
npm install
```

3. Set up Python backend:

```bash
cd server
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## Run Application

1. Start the Flask server

```bash
cd server
python app.py
```

2. Open a new terminal

```bash
npm start
```
