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
app.use(express.static(path.join(__dirname, 'public')));

// Default configuration
const defaultConfig = {
  showAfterSeconds: 3,
  message: "How likely are you to recommend DHL Express to a friend or colleague?",
  buttonColor: "#D40511", // DHL red color
  buttonText: "Give Feedback",
  useDHLSurvey: true, // Flag to use the DHL survey format
  apiUrl: process.env.API_URL || "" // Default to environment variable if available
};

// In-memory config storage for serverless environment
let savedConfig = {};

// Try to load config from file in development environment
if (process.env.NODE_ENV !== 'production') {
  try {
    const configFile = path.join(__dirname, 'config.json');
    if (fs.existsSync(configFile)) {
      const fileContent = fs.readFileSync(configFile, 'utf8');
      if (fileContent) {
        savedConfig = JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error('Error loading config file:', error);
  }
}

// Survey configuration endpoint
app.get('/survey-config', (req, res) => {
  // Merge default config with saved config
  const config = { ...defaultConfig, ...savedConfig };
  
  // Allow overriding config via query parameters
  if (req.query.showAfterSeconds) {
    const seconds = parseInt(req.query.showAfterSeconds);
    if (!isNaN(seconds) && seconds >= 0) {
      config.showAfterSeconds = seconds;
    }
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
  
  res.json(config);
});

// Endpoint to update configuration
app.post('/survey-config', (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validate showAfterSeconds
    if (newConfig.showAfterSeconds !== undefined) {
      const seconds = parseInt(newConfig.showAfterSeconds);
      if (isNaN(seconds) || seconds < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'showAfterSeconds must be a non-negative number' 
        });
      }
    }
    
    // Update saved config in memory
    savedConfig = { ...savedConfig, ...newConfig };
    
    // Save to file only in development environment
    if (process.env.NODE_ENV !== 'production') {
      const configFile = path.join(__dirname, 'config.json');
      fs.writeFileSync(configFile, JSON.stringify(savedConfig, null, 2));
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

// Endpoint to submit feedback
app.post('/submit-feedback', async (req, res) => {
  try {
    const feedback = req.body;
    feedback.timestamp = new Date().toISOString();
    
    // Get the API URL from config or environment variable
    const config = { ...defaultConfig, ...savedConfig };
    const apiUrl = config.apiUrl || process.env.API_URL;
    
    if (apiUrl) {
      // Send data to external API
      try {
        const response = await axios.post(apiUrl, feedback);
        console.log('Feedback sent to external API:', response.data);
        res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
      } catch (apiError) {
        console.error('Error sending feedback to API:', apiError.message);
        
        // In production, we can't save locally, so just return an error
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ 
            success: false, 
            message: 'Error submitting feedback to external API' 
          });
        }
        
        // In development, fallback to local storage
        saveFeedbackLocally(feedback);
        res.status(200).json({ 
          success: true, 
          message: 'Feedback saved locally (API connection failed)'
        });
      }
    } else {
      // No API URL configured
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ 
          success: false, 
          message: 'No API URL configured for feedback submission' 
        });
      }
      
      // In development, save locally
      saveFeedbackLocally(feedback);
      res.status(200).json({ success: true, message: 'Feedback saved locally' });
    }
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ success: false, message: 'Error processing feedback' });
  }
});

// Helper function to save feedback locally (only used in development)
function saveFeedbackLocally(feedback) {
  // Only proceed if we're not in production
  if (process.env.NODE_ENV === 'production') return;
  
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const feedbackFile = path.join(dataDir, 'feedback.json');
  
  // Read existing feedback or create empty array
  let feedbackData = [];
  if (fs.existsSync(feedbackFile)) {
    const fileContent = fs.readFileSync(feedbackFile, 'utf8');
    if (fileContent) {
      feedbackData = JSON.parse(fileContent);
    }
  }
  
  // Add new feedback
  feedbackData.push(feedback);
  
  // Write back to file
  fs.writeFileSync(feedbackFile, JSON.stringify(feedbackData, null, 2));
  console.log('Feedback saved locally');
}

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