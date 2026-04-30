# Hardball Web

React frontend for [Hardball](https://github.com/qalisem/hardball-backend) — NBA salary cap intelligence. Bloomberg-terminal aesthetic, live ticker, slide-in team drawer with cap-position visualizer, and a chat interface backed by Claude.

**Live:** https://dz3csw06yjedg.cloudfront.net

## Stack

- React 18 + Vite 5
- `lucide-react` for icons
- Single-component architecture (`src/Hardball.jsx`)
- Same-origin `/api/*` calls (proxied by CloudFront to the Flask backend)

## Local development

```bash
npm install
cp .env.example .env       # edit if you want to point at a local backend
npm run dev                # http://localhost:5173
```

For local development against a local backend, set `VITE_API_BASE=http://localhost:5000` in `.env`. For production builds, leave `VITE_API_BASE` empty so the frontend issues same-origin `/api/*` requests.

## Production build

```bash
npm run build              # outputs to dist/
```

## Deploy

```bash
aws s3 sync dist/ s3://hardball-web-qali --delete
aws cloudfront create-invalidation \
  --distribution-id E1AEOT2IV7WSET \
  --paths "/*"
```

Full S3 + CloudFront setup is documented in [hardball-backend/docs/DEPLOY.md](https://github.com/qalisem/hardball-backend/blob/main/docs/DEPLOY.md).

## License

MIT
