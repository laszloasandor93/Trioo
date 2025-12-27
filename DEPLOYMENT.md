# Deployment Checklist

## Fixes Applied for Picture Display Issues

### 1. Path Format
- ✅ Changed all paths from `./pictures/` to `pictures/` (relative paths work better in deployment)
- ✅ URL-encoded spaces in filenames (`about us.jpg` → `about%20us.jpg`)

### 2. Vercel Configuration
- ✅ Updated `vercel.json` to include all static assets
- ✅ Created `.vercelignore` to ensure pictures folder is included

### 3. Common Deployment Issues

#### If pictures still don't show:

1. **Check file names match exactly** (case-sensitive on Linux servers):
   - `Logo.png` (capital L)
   - `about%20us.jpg` (with space encoded)

2. **Verify pictures folder is in repository:**
   ```bash
   git add pictures/
   git commit -m "Add pictures folder"
   git push
   ```

3. **Check deployment platform settings:**
   - **Vercel**: Ensure "Include source files" is enabled
   - **Netlify**: Check that `pictures/` folder is in the deploy directory
   - **GitHub Pages**: Make sure `pictures/` is committed to the repository

4. **Clear browser cache** after deployment

5. **Check browser console** for 404 errors on image files

### 4. File Structure
```
/
├── index.html
├── styles.css
├── script.js
├── pictures/
│   ├── Logo.png
│   ├── about us.jpg
│   ├── gallery/
│   │   ├── 1.jpg
│   │   └── ...
│   └── ...
└── ...
```

### 5. Testing Locally
Before deploying, test locally:
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# Then visit http://localhost:8000
```

### 6. Alternative: Use Absolute Paths
If relative paths still don't work, you can use absolute paths from root:
- Change `pictures/logo.png` to `/pictures/logo.png`
- This requires proper base URL configuration

## Current Path Format
All images now use: `pictures/filename.ext`
- This is relative to the root directory
- Works in most deployment environments
- Compatible with Vercel, Netlify, GitHub Pages

