const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Default configuration
const defaultConfig = {
  showAfterSeconds: 3,
  message: "How likely are you to recommend DHL Express to a friend or colleague?",
  buttonColor: "#D40511", // DHL red color
  buttonText: "Give Feedback",
  useDHLSurvey: true, // Flag to use the DHL survey format
  apiUrl: "https://dashboard-survey12323.vercel.app/api/surveys" // Hardcoded API URL
};

// In-memory storage for configuration
let savedConfig = {};

// Load configuration from file in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const configPath = path.join(__dirname, '../config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      savedConfig = JSON.parse(configData);
      console.log('Configuration loaded from file:', savedConfig);
    }
  } catch (error) {
    console.error('Error loading config file:', error);
  }
}

// Endpoint to get survey configuration
app.get('/survey-config', (req, res) => {
  try {
    // Merge default config with saved config and query parameters
    const config = { ...defaultConfig, ...savedConfig };
    
    // Override with query parameters if provided
    if (req.query.showAfterSeconds) {
      config.showAfterSeconds = parseInt(req.query.showAfterSeconds);
    }
    if (req.query.message) {
      config.message = req.query.message;
    }
    if (req.query.buttonColor) {
      config.buttonColor = req.query.buttonColor;
    }
    if (req.query.buttonText) {
      config.buttonText = req.query.buttonText;
    }
    if (req.query.useDHLSurvey !== undefined) {
      config.useDHLSurvey = req.query.useDHLSurvey === 'true';
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error getting configuration:', error);
    res.status(500).json({ error: 'Error getting configuration' });
  }
});

// Endpoint to update survey configuration
app.post('/survey-config', (req, res) => {
  try {
    // Update in-memory configuration
    savedConfig = { ...savedConfig, ...req.body };
    
    // Save to file only in development
    if (process.env.NODE_ENV !== 'production') {
      const configPath = path.join(__dirname, '../config.json');
      fs.writeFileSync(configPath, JSON.stringify(savedConfig, null, 2));
      console.log('Configuration saved to file:', savedConfig);
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config: savedConfig
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ success: false, message: 'Error updating configuration' });
  }
});

// Note: submit-feedback endpoint removed - widget now posts directly to dashboard API

// For local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access survey config at: http://localhost:${PORT}/survey-config`);
    console.log(`Include widget with: <script src="http://localhost:${PORT}/embed.js"></script>`);
  });
}

// Export the Express API for Vercel
module.exports = app;