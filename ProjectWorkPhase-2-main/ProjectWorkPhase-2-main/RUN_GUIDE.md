# How to Run the Neuro-Adaptive Speech Therapy Website

This guide will help you set up and run the Neuro-Adaptive AI Speech Therapy Platform on your local machine.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages.

### 2. Start the Development Server

Run the following command to start the local development server:

```bash
npm run dev
```

The application will start and you'll see output similar to:

```
VITE v6.1.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Open in Browser

Open your web browser and navigate to:

```
http://localhost:5173/
```

## Features & Usage

### Local Data Storage

This application uses **localStorage** for data persistence:
- All profiles, exercises, and session data are stored in your browser
- Data persists between page refreshes
- Data is specific to your browser and device

### Default Features

1. **Sample Exercises**: Pre-loaded exercises in Tamil, English, and both languages
2. **Auto-Login**: Automatically logs you in as "Local User"
3. **Mock AI Analysis**: Provides feedback based on session performance without external API calls

### Main Pages

- **Home**: Dashboard with quick access to all features
- **Profile**: Create and manage child profiles
- **Exercises**: Browse available speech therapy exercises
- **Therapy Session**: Conduct interactive therapy sessions with webcam and audio
- **Session History**: View past therapy sessions
- **Progress**: Track improvement over time

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder. You can preview the production build with:

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### Browser Permissions

The therapy session requires:
- **Camera access**: For emotion detection
- **Microphone access**: For speech recording

Make sure to allow these permissions when prompted.

### Clearing Data

To reset all data, open browser DevTools (F12) and run:

```javascript
localStorage.clear()
```

Then refresh the page.

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Query
- **Animations**: Framer Motion
- **Data Storage**: Browser localStorage
