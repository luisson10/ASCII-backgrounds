This is a [Next.js](https://nextjs.org) project for converting images into ASCII art.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

This app is ready for Railway's native Node/npm deployment flow.

Railway can use the existing scripts in `package.json`:

```bash
npm install
npm run build
npm run start
```

Notes:

- `next start` already uses Railway's `PORT` environment variable.
- In Next.js 16, `next start` binds to `0.0.0.0` by default.
- `package.json` now declares `node >=20.9.0`, matching Next.js 16 requirements.
- `railway.json` pins the service to `RAILPACK`, starts the local Next binary explicitly on `0.0.0.0:$PORT`, and adds a `/health` healthcheck.

If you deploy from GitHub on Railway, you should not need a Dockerfile or major platform-specific code changes.

## Recommended Deployment Workflow

1. Push changes to a branch and open a pull request.
2. Wait for the GitHub Actions CI workflow to pass (`npm run lint` and `npm run build`).
3. Merge to your deploy branch only after CI is green.
4. Let Railway auto-deploy from GitHub.
5. If a deploy fails, inspect the Railway deployment logs first, then compare them to local `npm run build` output.

If you suspect stale Railway cache or old builder behavior:

- Trigger a redeploy before deleting the service.
- Confirm the deployment is using config from `railway.json`.
- If needed, clear the build cache from Railway and redeploy instead of recreating the service.
- Recreating the service should be a last resort, not the normal workflow.
