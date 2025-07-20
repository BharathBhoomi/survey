# Netlify Deployment Checklist

## Pre-deployment Steps

- [x] ✅ Created `netlify.toml` configuration file
- [x] ✅ Converted Express API routes to Netlify Functions
- [x] ✅ Updated `package.json` with Netlify-specific scripts
- [x] ✅ Fixed embed script references in HTML files
- [x] ✅ Added deployment documentation

## Deployment Options

### 🚀 Quick Deploy (Recommended)

1. **Via Netlify Dashboard:**
   - Go to https://app.netlify.com/projects/
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the entire `feedback-form-netty` folder
   - Netlify will automatically detect the configuration

### 🔗 Git-based Deploy (Best for ongoing development)

1. **Push to Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Netlify ready"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com/projects/
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository
   - Build settings will be auto-detected from `netlify.toml`

### 🛠️ CLI Deploy

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd feedback-form-netty
   netlify login
   netlify init
   netlify deploy --prod
   ```

## Post-deployment

1. **Test the deployment:**
   - Visit your Netlify site URL
   - Check that the survey popup appears after 3 seconds
   - Test the `/survey-config` API endpoint

2. **Update embed URLs:**
   - Replace any hardcoded URLs in your websites with your new Netlify domain
   - Example: `https://your-site-name.netlify.app/embed.js`

3. **Configure custom domain (optional):**
   - In Netlify dashboard: Site settings → Domain management
   - Add your custom domain and configure DNS

## Environment Variables (Optional)

If you need to customize default configuration:

1. Go to Site settings → Environment variables
2. Add `SURVEY_CONFIG` with JSON value:
   ```json
   {
     "showAfterSeconds": 5,
     "message": "Your custom message",
     "buttonColor": "#your-color",
     "buttonText": "Your button text",
     "useDHLSurvey": true,
     "apiUrl": "https://your-api-endpoint.com"
   }
   ```

## Troubleshooting

- **Functions not working?** Check the Functions tab in Netlify dashboard for error logs
- **CORS issues?** The serverless function includes CORS headers
- **Widget not loading?** Check browser console for JavaScript errors
- **Build failing?** Check the Deploy log in Netlify dashboard

## Success! 🎉

Once deployed, your survey widget will be available at:
- **Demo page:** `https://your-site.netlify.app/`
- **Embed script:** `https://your-site.netlify.app/embed.js`
- **API endpoint:** `https://your-site.netlify.app/survey-config`