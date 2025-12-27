# Vercel Analytics Setup

## For Static HTML Sites

Since this is a **static HTML site** (not Next.js), Vercel Analytics works differently:

### Automatic Setup (Recommended)

**Vercel Analytics is automatically enabled** when you deploy to Vercel. No code changes needed!

1. Deploy your site to Vercel
2. Go to your project dashboard
3. Navigate to **Analytics** tab
4. Enable **Web Analytics**

That's it! Analytics will start tracking automatically.

### Manual Setup (If Needed)

If you want to explicitly add analytics tracking, you can use:

#### Option 1: Vercel Web Analytics (Recommended for Static Sites)

Add this before `</body>`:

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://va.vercel-scripts.com/v1/script.js';
    script.defer = true;
    script.setAttribute('data-website-id', 'YOUR_WEBSITE_ID');
    document.head.appendChild(script);
  })();
</script>
```

**Note:** You'll need to get your Website ID from Vercel dashboard → Analytics → Web Analytics

#### Option 2: Using @vercel/analytics Package

For static sites, you can load it via CDN:

```html
<script type="module">
  import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics@latest/dist/analytics.js';
  inject();
</script>
```

### Important Notes

- **Next.js import won't work**: `import { Analytics } from "@vercel/analytics/next"` is only for Next.js apps
- **Static sites**: Use the automatic Vercel Analytics or the script-based approach above
- **No build step needed**: Analytics works automatically when deployed to Vercel

### Current Setup

The current HTML file has a placeholder comment. After deploying to Vercel:
1. Enable Analytics in Vercel dashboard
2. Analytics will work automatically
3. No code changes needed!

### Verify It's Working

After deployment:
1. Visit your deployed site
2. Check Vercel dashboard → Analytics
3. You should see page views and other metrics

