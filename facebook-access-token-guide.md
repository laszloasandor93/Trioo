# Facebook Access Token Guide

## What is a Facebook Access Token?

A **Facebook Access Token** is a credential that allows your application to access Facebook's Graph API on behalf of a user or page. It's like a password that grants permission to read or modify data.

Think of it as:
- A **key** that unlocks Facebook's API
- A **permission slip** that says "this app can access this data"
- A **temporary password** (some tokens expire)

## Types of Access Tokens

### 1. **User Access Token**
- For accessing user's personal data
- Short-lived (1-2 hours) or long-lived (60 days)
- Requires user login

### 2. **Page Access Token** (What you need!)
- For accessing a Facebook Page's data
- Can be long-lived (never expires if set up correctly)
- Requires page admin permissions

### 3. **App Access Token**
- For app-level operations
- Less useful for reading page data

## How to Get a Page Access Token

### Method 1: Using Graph API Explorer (Easiest)

1. **Go to Graph API Explorer:**
   - Visit: https://developers.facebook.com/tools/explorer/

2. **Select Your App:**
   - Click "Meta App" dropdown
   - Select your app (or create one if needed)

3. **Get User Token:**
   - Click "Generate Access Token"
   - Select permissions: `pages_read_engagement`, `pages_show_list`
   - Click "Generate Access Token"
   - **Copy this token** (you'll need it)

4. **Get Page ID:**
   - In Graph API Explorer, use: `me/accounts`
   - This shows all pages you manage
   - Find "Hookah Trio" and note its **Page ID** (not the username)

5. **Get Page Access Token:**
   - Use: `{page-id}?fields=access_token`
   - Replace `{page-id}` with the actual Page ID
   - This returns the Page Access Token

### Method 2: Using Facebook Login (For Production)

1. **Create Facebook App:**
   - Go to https://developers.facebook.com/
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Fill in app details

2. **Add Facebook Login:**
   - In app dashboard, add "Facebook Login" product
   - Configure OAuth redirect URIs

3. **Get Long-Lived Token:**
   - Exchange short-lived token for long-lived (60 days)
   - Or use Page Access Token (never expires if page admin)

### Method 3: Using Access Token Tool

1. Go to: https://developers.facebook.com/tools/accesstoken/
2. Select your app
3. Find your page in the list
4. Copy the Page Access Token

## Important Notes

### ⚠️ Security
- **Never share your access token publicly**
- **Don't commit tokens to Git**
- **Use environment variables** for production
- Tokens can be revoked if compromised

### ⚠️ Token Expiration
- **Short-lived tokens:** Expire in 1-2 hours
- **Long-lived tokens:** Expire in 60 days
- **Page tokens:** Can be made permanent (never expire)

### ⚠️ Permissions Needed
For reading opening hours, you need:
- `pages_read_engagement` - Read page engagement data
- `pages_show_list` - See list of pages you manage

## Getting a Permanent Page Access Token

To get a token that never expires:

```javascript
// Step 1: Get short-lived user token (from Graph API Explorer)
const shortLivedToken = 'YOUR_SHORT_LIVED_TOKEN';

// Step 2: Exchange for long-lived user token (60 days)
const longLivedUserToken = await fetch(
  `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=${shortLivedToken}`
);

// Step 3: Get page access token (never expires)
const pageToken = await fetch(
  `https://graph.facebook.com/v18.0/{page-id}?fields=access_token&access_token=${longLivedUserToken}`
);
```

## Quick Start (Simplest Method)

1. **Go to:** https://developers.facebook.com/tools/explorer/
2. **Select your app** (or create one)
3. **Click "Generate Access Token"**
4. **Select permissions:** `pages_read_engagement`
5. **Copy the token**
6. **Use this query:** `me/accounts` to see your pages
7. **Find Hookah Trio's Page ID**
8. **Get page token:** `{page-id}?fields=access_token`

## Example: Finding Page ID from URL

If you have the Facebook page URL: `https://www.facebook.com/HookahTrio`

You can find the Page ID by:
1. Going to the page
2. Click "About" → "Page Info"
3. Scroll to find "Facebook Page ID"
4. Or use: `https://www.facebook.com/HookahTrio` in Graph API Explorer with `?fields=id`

## Using in Your Script

```javascript
const FACEBOOK_PAGE_ID = '123456789012345'; // The numeric Page ID
const ACCESS_TOKEN = 'EAABwzLix...'; // Your Page Access Token
```

**Remember:** Use the **Page ID** (numbers), not the page URL or username!




