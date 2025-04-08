export const BACKEND_URL = (process.env.REACT_APP_URL_PRE||'http://localhost:8000');

// Mock endpoint function (To simulate a developer only endpoint in the frontend code)
export const getSystemInfo = () => {
    return {
      version: process.env.REACT_APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      buildTime: new Date().toISOString(),
      debugMode: process.env.REACT_APP_DEBUG === "true"
    };
  };