# 🚀 Deployment Guide: RGPV Campus Bicycle Rental Platform

This guide outlines multiple recommended ways to deploy the **RGPV Cycle Rental Platform** to the public internet so it is accessible 24/7 on a live domain.

---

## Architecture Overview

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript, Tailwind CSS v4)
- **Database**: SQLite with Prisma ORM (`prisma/dev.db`)
- **File Storage**: Local uploads served dynamically via `/uploads/bikes/[filename]`
- **Ports**: Runs on port `3000`

Because the app utilizes local SQLite storage and file-system image uploads, **persistent container or VPS hosting (Render, Railway, Docker, or Ubuntu VPS)** is the easiest and most cost-effective method (zero external services needed).

---

## Option 1: Free Cloud Hosting on Render (Recommended - 5 Minutes)

Render provides free hosting with native Node.js and persistent storage support:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for RGPV Cycle Rental Platform"
   git remote add origin https://github.com/<your-username>/rgpv-cycle-rental.git
   git branch -M main
   git push -u origin main
   ```
2. **Create a Web Service on [Render.com](https://render.com)**:
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - Set **Runtime**: `Node`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm run start`
   - Under **Environment Variables**, add:
     - `DATABASE_URL`: `file:./prisma/dev.db`
     - `ADMIN_USERNAME`: `admin`
     - `ADMIN_PASSWORD`: `rgpvadmin@2026`
     - `NEXT_PUBLIC_WHATSAPP_PHONE`: `919876543210`
     - `NEXT_PUBLIC_CAMPUS_NAME`: `RGPV Bhopal`
3. Click **Deploy Web Service**.
4. In 2 minutes, Render gives you a free live URL: `https://rgpv-cycles.onrender.com`.

---

## Option 2: 1-Click Docker Deployment (Any Cloud VPS or Server)

A complete production `Dockerfile` and `docker-compose.yml` are already pre-configured in the repository.

1. **Deploy to any VPS (DigitalOcean, AWS EC2, Hostinger, Linode, etc.)**:
   ```bash
   git clone https://github.com/<your-username>/rgpv-cycle-rental.git
   cd rgpv-cycle-rental
   ```
2. **Start the production container**:
   ```bash
   docker compose up -d
   ```
3. The platform will start automatically with persistent volumes for both the database and uploaded images.
4. Point your domain (e.g. `cycles.rgpv.ac.in`) to the server's IP address.

---

## Option 3: VPS Self-Hosting (Ubuntu Server with PM2 & Nginx)

1. **Install Node.js 20 & PM2 on your server**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```
2. **Clone & Build the App**:
   ```bash
   git clone <repo-url> /var/www/rgpv-cycles
   cd /var/www/rgpv-cycles
   npm install
   npm run build
   ```
3. **Start with PM2 (Auto-Restart on Reboot)**:
   ```bash
   pm2 start npm --name "rgpv-cycles" -- start
   pm2 startup
   pm2 save
   ```
4. **Configure Nginx Reverse Proxy with SSL (HTTPS)**:
   ```nginx
   server {
       server_name cycles.rgpv.ac.in;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Run `sudo certbot --nginx -d cycles.rgpv.ac.in` for free automatic SSL certificates.

---

## Option 4: Vercel / Netlify Deployment (Serverless)

If you prefer deploying to Vercel:
1. Because Vercel serverless functions have a read-only filesystem, switch the database to a free cloud PostgreSQL database:
   - Create a free database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   - Update `DATABASE_URL` in `.env` with your Supabase/Neon connection string.
   - Run `npx prisma db push`.
2. Connect the repo on [Vercel](https://vercel.com) and deploy with 1 click.

---

## Option 5: Instant Live Preview Tunnel (Demo to Client in 30 Seconds)

If you want your client to open the website right now on their mobile phone while it runs on your machine:
```bash
npx localtunnel --port 3000
```
or via Cloudflare:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
This gives you an instant public HTTPS link (e.g. `https://quiet-river-12.loca.lt`) that anyone in the world can test immediately!
