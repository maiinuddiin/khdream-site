# Deployment Guide for Namecheap

This application is optimized for deployment on Namecheap's Node.js selector or a VPS with PM2.

## 1. Build the Application
Before uploading, you must build the application to generate the production-ready files.
Run the following command in your local terminal:
```bash
npm run build
```
This will create a `dist` folder containing:
- `assets/`: Client-side CSS and JS
- `index.html`: Main entry point for the browser
- `server.js`: The bundled production server

## 2. Upload Files to Namecheap
Upload the following files and folders to your Namecheap server (usually via FTP or File Manager):
- `dist/` (The entire folder)
- `data/` (The entire folder - contains your CMS data and invoices)
- `public/` (The entire folder - contains your uploads)
- `package.json`
- `.env` (Create this on the server with your production secrets)

## 3. Configure Node.js App in cPanel
1. Log in to cPanel and search for **"Setup Node.js App"**.
2. Click **"Create Application"**.
3. **Node.js version**: Select the latest stable version (e.g., 20.x or 22.x).
4. **Application mode**: Set to `production`.
5. **Application root**: The folder where you uploaded the files.
6. **Application URL**: Your domain name.
7. **Application startup file**: Set this to `dist/server.js`.
8. **Environment variables**: Add the following:
   - `PORT`: 3000 (or the port provided by Namecheap)
   - `NODE_ENV`: production
   - `ADMIN_SECRET_TOKEN`: A long, random string for admin access
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Your email settings

## 4. Install Dependencies
Once the app is created, click the **"Run npm install"** button in the cPanel Node.js selector.

## 5. Restart the Application
Click **"Restart"** to start your production server.

---

## Security Notes
- **HTTPS**: Ensure your domain has an SSL certificate (Namecheap provides free SSL via AutoSSL).
- **Secrets**: Never share your `.env` file or `ADMIN_SECRET_TOKEN`.
- **Backups**: Regularly backup the `data/` and `public/uploads/` folders, as these contain your dynamic content.
