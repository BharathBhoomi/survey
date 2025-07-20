# Survey Widget - Netlify Deployment

This project has been converted from Vercel to Netlify deployment. It's a survey popup widget that can be embedded on websites.

## Project Structure

- `public/` - Static files (HTML, CSS, JS)
- `netlify/functions/` - Serverless functions for Netlify
- `api/` - Original Express server (kept for local development)
- `netlify.toml` - Netlify configuration

## Deployment to Netlify

### Option 1: Deploy via Netlify Dashboard

1. Go to [https://app.netlify.com/projects/](https://app.netlify.com/projects/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`
5. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Option 3: Drag and Drop Deployment

1. Run the build command:
   ```bash
   npm run build
   ```

2. Create a deployment package by zipping the following:
   - `public/` folder contents
   - `netlify/` folder
   - `netlify.toml` file

3. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
4. Drag and drop your zip file

## Local Development

### Using Netlify Dev (Recommended)

```bash
npm install
npm run netlify-dev
```

This will start a local development server that simulates the Netlify environment.

### Using Express Server (Alternative)

```bash
npm install
npm run dev
```

## Configuration

The widget configuration can be customized via:

1. **Query parameters** in the `/survey-config` endpoint
2. **Environment variables** in Netlify dashboard
3. **Default configuration** in the serverless function

### Environment Variables (Optional)

You can set these in your Netlify dashboard under Site settings → Environment variables:

- `SURVEY_CONFIG`: JSON string with default configuration

## Key Differences from Vercel Version

1. **Serverless Functions**: Moved from `api/` to `netlify/functions/`
2. **Configuration**: Uses `netlify.toml` instead of `vercel.json`
3. **Routing**: Handled via Netlify redirects
4. **Build Process**: Simplified for static site deployment

## Widget Usage

To embed the widget on your website:

```html
<script src="https://your-netlify-site.netlify.app/embed.js"></script>
```

Replace `your-netlify-site.netlify.app` with your actual Netlify domain.

## API Endpoints

- `GET /survey-config` - Get widget configuration
- `POST /survey-config` - Update widget configuration (session only)

## Notes

- Configuration updates via POST are only stored in memory for the current session
- For persistent configuration storage, consider integrating with a database service
- The widget is designed to work with the DHL survey format by default