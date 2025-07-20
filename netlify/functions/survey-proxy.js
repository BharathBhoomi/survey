exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const API_URL = 'https://dashboard-survey12323.vercel.app/api/surveys';

  try {
    let response;
    
    if (event.httpMethod === 'GET') {
      // Forward GET request
      response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Netlify-Function-Proxy/1.0'
        }
      });
    } else if (event.httpMethod === 'POST') {
      // Forward POST request
      const body = event.body;
      
      // Validate request body
      if (!body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Request body is required' })
        };
      }

      // Parse and validate JSON
      let requestData;
      try {
        requestData = JSON.parse(body);
      } catch (parseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }

      // Add server-side metadata
      requestData.proxyTimestamp = new Date().toISOString();
      requestData.proxySource = 'netlify-function';
      requestData.clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

      console.log('📤 Proxying survey data:', JSON.stringify(requestData, null, 2));

      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Netlify-Function-Proxy/1.0'
        },
        body: JSON.stringify(requestData)
      });
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Get response data
    const responseData = await response.text();
    
    console.log(`📥 API Response Status: ${response.status}`);
    console.log(`📥 API Response Data: ${responseData}`);

    // Parse and enhance response for consistent format
    let enhancedResponse;
    try {
      const parsedData = JSON.parse(responseData);
      enhancedResponse = {
        ...parsedData,
        success: response.ok,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (parseError) {
      // If response is not JSON, wrap it
      enhancedResponse = {
        data: responseData,
        success: response.ok,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    }

    // Return the enhanced response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(enhancedResponse)
    };

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    
    // Enhanced error handling with specific CORS-safe responses
    let errorResponse = {
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      success: false
    };
    
    // Handle specific error types
    if (error.code === 'ENOTFOUND' || error.message.includes('fetch')) {
      errorResponse.error = 'External API unreachable';
      errorResponse.message = 'Unable to connect to the survey API. Please try again later.';
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};