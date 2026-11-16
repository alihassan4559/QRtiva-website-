# QRtiva — Free Online QR Code Generator

QRtiva is a fast, privacy-first web application for creating permanent, customizable static QR codes directly in the browser—with zero signups, zero watermarks, and instant exports in PNG, JPG, and vector SVG.

## Features

- **13 Dedicated QR Code Categories**:
  1. Website / URL (`/website-qr-code-generator`)
  2. WhatsApp (`/whatsapp-qr-code-generator`)
  3. Instagram (`/instagram-qr-code-generator`)
  4. Facebook (`/facebook-qr-code-generator`)
  5. TikTok (`/tiktok-qr-code-generator`)
  6. YouTube (`/youtube-qr-code-generator`)
  7. Snapchat (`/snapchat-qr-code-generator`)
  8. Wi-Fi (`/wifi-qr-code-generator`)
  9. Email (`/email-qr-code-generator`)
  10. Phone / SMS (`/phone-qr-code-generator`)
  11. Location / Maps (`/google-maps-qr-code-generator`)
  12. PDF / Document (`/pdf-qr-code-generator`)
  13. Other / Universal Link (`/universal-qr-code-generator`)
- **Client-Side Customization & Verification**: Custom colors, margin controls, optional center logo overlay, error correction levels (`L`, `M`, `Q`, `H`), action frames, and live `jsQR` scannability checks.
- **Static Read-Only SEO Blog**: 10 evergreen QR code guides (`/blog` and `/blog/<slug>`) stored directly in `src/data/blogPosts.ts` with zero external database or CMS dependencies.
- **Technical SEO & SSR Metadata**: Dynamic per-route `<title>`, `<meta>`, canonical URLs, Open Graph/Twitter cards, JSON-LD structured data (`WebSite`, `SoftwareApplication`, `Blog`, `BlogPosting`, `BreadcrumbList`, `FAQPage`, `ContactPage`), dynamic `/sitemap.xml` (31 URLs), and `/robots.txt`.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, `qrcode`, `jsqr`
- **Backend**: Express 4 (`server.ts`, bundled to `server.js` via `esbuild` for production)
- **Storage**: None required (static in-repo blog catalog + 100% client-side QR generation)

## Environment Variables

Copy `.env.example` to `.env` if you want to customize local runtime settings:

```env
NODE_ENV="production"
PORT="3000"
APP_URL="https://your-service.onrender.com"
```

- `NODE_ENV`: Set to `production` in production deployments.
- `PORT`: Listening port (automatically injected by Render; defaults to `3000`).
- `APP_URL` *(optional)*: Explicit canonical origin for `sitemap.xml`, `robots.txt`, and meta tags. When omitted, QRtiva derives the origin from incoming `Host` / `X-Forwarded-*` headers.

## Local Development

Requirements: Node.js `>= 20.0.0`

```bash
# 1. Install dependencies
npm install

# 2. Start Express + Vite development server on port 3000
npm run dev
```

Open `http://localhost:3000`.

## Production Build & Run

```bash
# 1. Install dependencies
npm ci

# 2. Type-check TypeScript
npm run lint

# 3. Build client bundle (dist/) and production server (server.js)
npm run build

# 4. Start production server
npm start
```

## Deploying to Render (Free Web Service)

- **Environment**: Node (`>= 20.0.0`)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/healthz`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `APP_URL=https://your-domain-or-render-url.onrender.com` *(optional)*

## Project Structure

```text
.
├── index.html               # HTML entry template with SSR meta placeholders
├── metadata.json            # App manifest metadata
├── package.json             # Dependencies & build/start scripts
├── server.ts                # Express server (SSR head injection, sitemap.xml, robots.txt, static dist/)
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite & Tailwind CSS configuration
├── public/images/blog/      # Optimized blog featured images (.jpg & .webp)
└── src/
    ├── App.tsx              # Client router
    ├── components/          # UI components (QR Studio, Layout, MarkdownRenderer, BlogImage)
    ├── data/                # 13 QR categories, SEO page definitions, and 10 static blog articles
    ├── lib/                 # QR engine, smart link detector, client/SSR SEO head builders
    ├── pages/               # HomePage, CategoryLandingPage, BlogPage, BlogArticlePage, StaticPages
    └── types/               # Shared blog types & markdown helpers
```

## Support

Email support: [ali6286791@gmail.com](mailto:ali6286791@gmail.com)
