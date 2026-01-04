# Buoy Conditions Website

A React project that displays North American buoy data provided by NDBC/NOAA. The site requires Netlify serverless functions at `netlify/functions/` to download data.

## Installation

1. Install required dependencies:

```bash
npm install
```

## Project Structure

```
buoy_condtions_react/
├── netlify/
│   └── functions/          # Netlify serverless functions
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared components
│   ├── constants/          # Shared constants
│   ├── helpers/            # Shared utility functions
│   ├── hooks/              # Shared React hooks
│   ├── utils/              # Shared utilities
│   ├── pages/              # Page components
│   │   ├── Dashboard/      # Dashboard page and assets
│   │   └── Buoy_Map/       # Map page and assets
│   └── App.js              # Main app component
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```


### Installation

1. Clone the repository

2. Set up Python backend:

```bash
cd server
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

3. Install client dependencies:

```bash
npm install
```



### Architecture Overview

#### **Shared Resources** (`src/`)

- **components/**: Reusable UI components used across multiple pages
- **hooks/**: Shared state management and data fetching logic
- **utils/**: Core data fetching and caching utilities
- **constants/**: Static data like station information
- **helpers/**: Utility functions for data conversion

#### **Page-Specific Resources** (`src/pages/`)

- **Dashboard/**: Grid view of buoy stations with filtering and historical data
- **Buoy_Map/**: Interactive map view with station markers and popups

#### **Serverless Functions** (`netlify/functions/`)

- Functions for fetching NOAA buoy data and historical information
