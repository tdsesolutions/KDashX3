# KDashX3 - GitHub Pages Deployment Instructions

**Branch:** `pages-ready`  
**Status:** Ready for deployment (NOT YET DEPLOYED)  
**Target URL:** https://tdsesolutions.github.io/KDashX3/

---

## Prerequisites

✅ Branch `pages-ready` pushed to GitHub  
✅ Workflow file `.github/workflows/pages.yml` in place  
✅ Build verified locally  

---

## Deployment Steps

### Step 1: Enable GitHub Pages

1. Go to GitHub repository: https://github.com/tdsesolutions/KDashX3
2. Click **Settings** tab (top navigation)
3. In left sidebar, click **Pages** (under Code and automation)
4. Under "Build and deployment", set **Source** to: `GitHub Actions`
5. Click **Save**

### Step 2: Merge pages-ready to main

Once you want to deploy, merge the `pages-ready` branch:

```bash
# Option A: GitHub PR
1. Go to https://github.com/tdsesolutions/KDashX3/pulls
2. Click "New pull request"
3. base: main ← compare: pages-ready
4. Create PR and merge

# Option B: Command line
git checkout main
git merge pages-ready
git push origin main
```

### Step 3: Verify Deployment

After merging, the workflow will automatically run:

1. Go to **Actions** tab: https://github.com/tdsesolutions/KDashX3/actions
2. Watch for "Deploy to GitHub Pages" workflow
3. Wait for green checkmark ✅
4. Visit: https://tdsesolutions.github.io/KDashX3/

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Opens http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Build fails
- Check Actions logs: https://github.com/tdsesolutions/KDashX3/actions
- Ensure `package.json` is valid JSON
- Ensure `vite.config.js` exists

### 404 errors on refresh
- SPA routing is configured via `404.html` in `/public`
- Ensure `base: '/KDashX3/'` is set in `vite.config.js`

### Assets not loading
- Check browser console for 404s
- Verify `base` path matches repo name exactly
- Ensure all imports use relative paths

---

## Files Added for Pages

| File | Purpose |
|------|---------|
| `index.html` | Entry point with SPA routing script |
| `vite.config.js` | Vite config with GitHub Pages base path |
| `package.json` | Dependencies and scripts |
| `src/main.js` | App entry with router |
| `.github/workflows/pages.yml` | GitHub Actions workflow |
| `public/404.html` | SPA routing fallback |
| `DEPLOY_INSTRUCTIONS.md` | This file |

---

## Important Notes

- **DO NOT** delete the `404.html` in `public/` - required for SPA routing
- **DO NOT** change `base: '/KDashX3/'` in `vite.config.js` unless repo is renamed
- **DO NOT** merge to main until ready to deploy publicly

---

## Expected URL

After deployment, the dashboard will be live at:

```
https://tdsesolutions.github.io/KDashX3/
```

---

## Verification Checklist

Before merging to main:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` works locally
- [ ] `npm run build` creates `dist/` folder
- [ ] `dist/` contains `index.html` and `assets/`
- [ ] GitHub Pages source set to "GitHub Actions"
- [ ] Workflow file is in `.github/workflows/pages.yml`

---

**Ready to deploy?** Follow Step 1 and Step 2 above.
