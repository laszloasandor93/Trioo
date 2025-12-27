# Hookah Trio Opening Status Checker

This script checks if Hookah Trio is currently open on Google Maps every minute.

## Setup

### 1. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Maps JavaScript API** (for browser version)
4. Create credentials (API Key)
5. Restrict the API key to only the Places API and Maps JavaScript API for security

### 2. Configure the Script

Open `check-opening-status.js` and replace `YOUR_GOOGLE_API_KEY_HERE` with your actual API key:

```javascript
const GOOGLE_API_KEY = 'your-actual-api-key-here';
```

## Usage

### Browser Version

Include the script in your HTML:

```html
<script src="check-opening-status.js"></script>
```

The script will automatically:
- Find Hookah Trio on Google Maps
- Check if it's open every minute
- Log the status to the console

### Node.js Version

1. Install dependencies:
```bash
npm install axios
```

2. Uncomment the Node.js version in the script (the commented section at the bottom)

3. Run:
```bash
node check-opening-status.js
```

## Output

The script logs messages like:
```
[10:30:45 AM] Hookah Trio: Currently OPEN
[10:31:45 AM] Hookah Trio: Currently CLOSED (Opens at 12:00)
```

## Customization

- Change `CHECK_INTERVAL` to adjust how often it checks (default: 60000ms = 1 minute)
- Modify `PLACE_NAME` if the business name is different
- The script automatically finds the place in Târgu Mureș, Romania

## Notes

- The script requires an active internet connection
- Google Places API has usage limits (free tier: $200/month credit)
- Make sure to keep your API key secure and don't commit it to version control




