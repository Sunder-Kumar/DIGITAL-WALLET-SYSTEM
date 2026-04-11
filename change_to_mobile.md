# 📱 How to Convert SecureWallet into a Native Mobile App

This guide describes how to transform your React web application into a native Android/iOS app using **Capacitor**, ready for publishing on the Google Play Store or Apple App Store.

---

## 🛠️ Step 1: Install Capacitor Mobile Engine

Open your terminal in the `frontend` directory and install the core dependencies:

```powershell
cd frontend
npm install @capacitor/core @capacitor/cli
```

Next, initialize Capacitor in your project:

```powershell
npx cap init SecureWallet com.sunder.securewallet --web-dir dist
```
*   **App Name:** SecureWallet
*   **App ID:** com.sunder.securewallet (Reverse domain notation)

---

## 🤖 Step 2: Add Android Platform

1.  Install the Android platform package:
    ```powershell
    npm install @capacitor/android
    ```
2.  Build your React project to generate the `dist` folder:
    ```powershell
    npm run build
    ```
3.  Add the Android project files:
    ```powershell
    npx cap add android
    ```

---

## 🎨 Step 3: Assets (Icons & Splash Screens)

Google Play requires specific icon sizes. You can automate this:

1.  Create a `resources` folder in the root.
2.  Add a `icon.png` (at least 1024x1024) and `splash.png` (at least 2732x2732).
3.  Install and run the asset generator:
    ```powershell
    npm install @capacitor/assets --save-dev
    npx capacitor-assets generate
    ```

---

## 🚀 Step 4: Run on a Real Device

1.  Connect your Android phone via USB and enable **Developer Mode/USB Debugging**.
2.  Sync your React code with the Android project:
    ```powershell
    npx cap sync
    ```
3.  Open the project in **Android Studio**:
    ```powershell
    npx cap open android
    ```
4.  In Android Studio, select your phone in the top toolbar and click the **Run (Green Play)** button.

---

## 🔒 Step 5: Native Features (Permissions)

Since SecureWallet uses the camera for "Scan to Pay", you need the native camera plugin:

1.  Install the plugin:
    ```powershell
    npm install @capacitor/camera
    npx cap sync
    ```
2.  In `android/app/src/main/AndroidManifest.xml`, ensure these permissions are present:
    ```xml
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    ```

---

## 📦 Step 6: Generate signed APK/Bundle for Play Store

When you are ready to publish:

1.  Open Android Studio.
2.  Go to **Build > Generate Signed Bundle / APK...**
3.  Choose **Android App Bundle** (AAB) for Play Store.
4.  Create a new **KeyStore** (Store this safely! You need it for updates).
5.  Set the Build Variant to **release**.
6.  Locate the generated `.aab` file in `android/app/release/`.

---

## 📤 Step 7: Publish to Google Play Console

1.  Create a developer account at [Play Console](https://play.google.com/console) ($25 one-time fee).
2.  Create a "New App".
3.  Complete the Store Listing (Screenshots, Description, Privacy Policy).
4.  Upload your `.aab` file under **Production > Create new release**.
5.  Submit for review!

---

### 💡 Pro Tips for Mobile:
*   **API URLs:** Ensure your `VITE_API_URL` uses your live **Railway** link, as `localhost` or local IPs won't work on mobile data.
*   **Haptic Feedback:** Use the `@capacitor/haptics` plugin to make the phone vibrate when a payment is sent!
*   **Deep Linking:** You can configure the app so that clicking a SecureWallet link in a browser automatically opens the app.
