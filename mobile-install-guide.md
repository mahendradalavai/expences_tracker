# 📱 How to Run & Install My Expenses on Android

Your app has been transformed into a **Progressive Web App (PWA)**!

When installed on your mobile phone:
- ✅ **No browser URL bar or controls** (runs full-screen standalone)
- ✅ **Custom App Icon** with green theme and ₹ rupee badge on your home screen
- ✅ **Status bar color** matching your app's theme (`#176b55`)
- ✅ **Realtime database sync** directly with Supabase

---

## 🚀 Method 1: Instant Install on Your Android Phone (Zero Setup)

Both your computer and your phone just need to be on the **same Wi-Fi network**.

### Step 1: Open on Your Phone's Chrome Browser
1. Unlock your Android phone and connect to the same Wi-Fi.
2. Open **Google Chrome** on your phone.
3. Type this URL into the address bar:
   ```text
   http://192.168.31.126:8080/
   ```

### Step 2: Install as Native App
1. When the page loads, you will see an **"Install My Expenses"** banner at the top.
2. Tap **"Install"** (or tap the **three dots `⋮`** at top-right of Chrome and choose **"Install app"** or **"Add to Home screen"**).
3. Tap **Add / Install**.

🎉 Look at your phone's home screen or app drawer: you now have **"Expenses"** installed as an app. Tap it and it opens as a clean, full-screen mobile app!

---

## 📦 Method 2: Convert to Downloadable `.apk` File

If you want an actual `.apk` installer file to distribute or send to friends:

### Option A: Use PWABuilder (Easiest & Free)
1. Deploy your site to a free host like **Vercel**, **Netlify**, or **GitHub Pages** (takes ~1 minute).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
3. Enter your deployed URL.
4. Click **"Package for Android"** → PWABuilder generates an Android `.apk` and `.aab` package for you.

### Option B: Cloud Build via GitHub Actions
We can add an automated GitHub Actions script that compiles a Capacitor Android APK in GitHub's cloud and outputs a downloadable `app-debug.apk` directly to you.
