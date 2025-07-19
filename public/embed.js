/**
 * Survey Widget Loader Script
 * This script dynamically loads the widget.js file which contains the actual survey popup logic
 */
(function() {
  // Create a new script element
  const script = document.createElement('script');
  script.type = 'text/javascript';
  
  // Get the current script's URL to determine the server origin
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  // Extract the base URL from the current script
  const baseUrl = currentScript.src.split('/').slice(0, -1).join('/');
  
  // Set the source of the new script to widget.js
  script.src = `${baseUrl}/widget.js`;
  
  // Append the script to the document head
  document.head.appendChild(script);
  
  // Add a global variable to store the base URL for the widget to use
  window.SURVEY_WIDGET_BASE_URL = baseUrl;
  
  console.log('Survey widget loader initialized');
})();