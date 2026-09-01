# KH Dream Services & Tourism

## How to Deploy on GitHub (Fix for Blank Site)

If your GitHub Pages site is currently showing a blank page, it is because GitHub Pages was trying to serve raw TypeScript source files (`index.tsx`) instead of running the Vite build pipeline.

### Solution: 2-Click GitHub Pages Setup (Recommended)

1. Push your latest code (including the `.github/workflows/deploy.yml` workflow we added) to your GitHub repository on the `main` or `master` branch.
2. Go to your repository on GitHub.
3. Click **Settings** (top tab) -> **Pages** (in the left sidebar).
4. Under **Build and deployment**:
   - Change **Source** from *"Deploy from a branch"* to **"GitHub Actions"**.
5. Go to the **Actions** tab on your repository — you will see the **Deploy to GitHub Pages** workflow run automatically.
6. Once complete, your site will be live and fully functional at `https://<your-username>.github.io/<repo-name>/`.

---

### Alternative: Deploy on Vercel, Netlify, or Cloudflare Pages (Instant & Free)

1. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) or [Cloudflare Pages](https://pages.cloudflare.com).
2. Connect your GitHub repository.
3. Keep default settings (`Build Command: npm run build`, `Output Directory: dist`).
4. Click **Deploy**.
