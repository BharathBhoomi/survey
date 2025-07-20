const fs = require('fs');
const path = require('path');


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

// Load configuration from environment or file
try {
  // In Netlify, we'll use environment variables or default config
  // since file system is read-only in serverless functions
  if (process.env.SURVEY_CONFIG) {
    savedConfig = JSON.parse(process.env.SURVEY_CONFIG);
  }
} catch (error) {
  console.error('Error loading config:', error);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // GET request - return configuration
      const queryParams = event.queryStringParameters || {};
      
      // Merge default config with saved config
      const config = { ...defaultConfig, ...savedConfig };
      
      // Override with query parameters if provided
      if (queryParams.showAfterSeconds) {
        config.showAfterSeconds = parseInt(queryParams.showAfterSeconds);
      }
      if (queryParams.message) {
        config.message = queryParams.message;
      }
      if (queryParams.buttonColor) {
        config.buttonColor = queryParams.buttonColor;
      }
      if (queryParams.buttonText) {
        config.buttonText = queryParams.buttonText;
      }
      if (queryParams.useDHLSurvey !== undefined) {
        config.useDHLSurvey = queryParams.useDHLSurvey === 'true';
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(config)
      };
    }
    
    if (event.httpMethod === 'POST') {
      // POST request - update configuration
      const body = JSON.parse(event.body || '{}');
      
      // Update in-memory configuration
      savedConfig = { ...savedConfig, ...body };
      
      // Note: In Netlify, we can't persist to file system
      // Configuration updates will only persist for the duration of the function execution
      // For persistent storage, you'd need to use a database or external storage service
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Configuration updated successfully (session only)',
          config: savedConfig
        })
      };
    }
    
    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Error in survey-config function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};