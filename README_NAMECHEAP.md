# Namecheap Deployment Guide for Kingdom Horizons

To deploy this application to Namecheap Shared Hosting (using Node.js Selector in cPanel):

## 1. Local Build
Run the following command on your local machine:
```bash
npm run build
```
This will create a `dist` folder.

## 2. Upload Files
Upload the following files and folders to your Namecheap hosting (e.g., in a folder like `public_html/kh-app` or a subdomain folder):
- `dist/` (The entire folder)
- `data/` (The entire folder - contains your CMS data)
- `public/` (The entire folder - contains your uploads)
- `server.ts`
- `package.json`
- `.env` (Create this on the server or upload your local one)

## 3. cPanel Configuration
1. Log in to cPanel.
2. Search for **"Setup Node.js App"**.
3. Click **"Create Application"**.
4. **Node.js version**: Select 18.x or higher.
5. **Application mode**: Set to `production`.
6. **Application root**: The folder where you uploaded the files (e.g., `kh-app`).
7. **Application URL**: Your domain or subdomain.
8. **Application startup file**: Set to `server.ts` (or `server.js` if you compiled it, but Namecheap's Node.js selector can often run `.ts` if `tsx` is installed).
   - *Note*: It is recommended to use `tsx` to run the `.ts` file directly. In your `package.json`, ensure the `start` script is `"tsx server.ts"`.

## 4. Environment Variables
In the Node.js App configuration page in cPanel, add the following **Environment variables**:
- `NODE_ENV`: `production`
- `ADMIN_SECRET_TOKEN`: (A long random string, e.g., `kh_dream_secure_2026_!@#`)
- `SMTP_HOST`: (e.g., `mail.khdreamservices.com`)
- `SMTP_PORT`: `465`
- `SMTP_SECURE`: `true`
- `SMTP_USER`: (Your email)
- `SMTP_PASS`: (Your email password)
- `SMTP_FROM`: (e.g., `Kingdom Horizons <info@khdreamservices.com>`)

## 5. Install Dependencies
Once the app is created, click **"Run npm install"** in the cPanel Node.js App interface.

## 6. Security Note
- The `ADMIN_SECRET_TOKEN` you set in cPanel **MUST** match what you use when logging in (it's handled automatically by the app, but ensure the variable is set before trying to send emails or save changes).
- Ensure the `data/` folder has write permissions so the app can save CMS changes.
