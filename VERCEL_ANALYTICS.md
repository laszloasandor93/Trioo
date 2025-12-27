# Vercel Web Analytics Setup

## Static HTML Site Implementation

This project is a **static HTML site** deployed on Vercel. Vercel Web Analytics has been integrated to track visitor behavior and page views.

## Implementation

### What was done

The Vercel Web Analytics tracking script has been added to the main `index.html` file:

```html
<!-- Vercel Web Analytics -->
<script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

This script:
- Creates the `window.va` object to queue analytics events
- Loads the Vercel insights script with the `defer` attribute for optimal performance
- Automatically tracks page views and visitor interactions

### Prerequisites Met

- ✅ Vercel account connected
- ✅ Project deployed to Vercel
- ✅ Vercel CLI available in project dependencies

### Enabling Web Analytics on Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the TRIOOO project
3. Click the **Analytics** tab
4. Click **Enable** button in the dialog
5. After the next deployment, analytics routes (`/_vercel/insights/*`) will be automatically created

### How It Works

Once deployed to Vercel with Web Analytics enabled:

1. The tracking script automatically sends data about:
   - Page views
   - Visitor interactions
   - Performance metrics
   - Geographic location
   - Device and browser information

2. Data appears in the Vercel Dashboard under **Analytics** tab

3. You can:
   - View real-time visitor counts
   - Monitor page views by URL
   - Track bounce rates
   - Analyze visitor trends
   - Filter data by date range and other criteria

### Verification

After deployment, verify analytics is working:

1. Visit your deployed site at https://triomures.vercel.app (or your custom domain)
2. Open browser DevTools → Network tab
3. Look for a request to `/_vercel/insights/view` - this confirms tracking is active
4. Go to Vercel Dashboard → Analytics to see the data
5. After 24 hours, you should see visitor metrics

### Notes

- **No additional code needed**: The analytics script automatically tracks all page views
- **Route support**: When deployed to Vercel, the script can detect route changes
- **Privacy**: Vercel Analytics respects user privacy and doesn't collect personally identifiable information (PII)
- **Performance**: The tracking script is loaded asynchronously with `defer` attribute, so it doesn't block page rendering

## Next Steps

Once you have data in the dashboard, you can:
- View detailed analytics in the Vercel Dashboard
- Export data for further analysis
- Monitor performance and user behavior
- Optimize the site based on visitor insights

For more information, see the [Vercel Web Analytics documentation](https://vercel.com/analytics).
