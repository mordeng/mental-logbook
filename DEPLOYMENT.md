# Deployment Guide - Mental Health Logbook

## Prerequisites

- GitHub account (repository already exists)
- Vercel account (free tier is sufficient)
- Basic understanding of environment variables

---

## Step 1: Prepare for Deployment

### 1.1 Update Prisma Schema for PostgreSQL

The app currently uses SQLite for development. For production, we'll use PostgreSQL.

**File: `prisma/schema.prisma`**

Change the datasource block from:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Update `.gitignore`

Ensure these are in `.gitignore`:
```
.env
.env.local
.env.production
node_modules/
.next/
*.db
*.db-journal
```

---

## Step 2: Set Up Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 2.2 Import Project
1. Click "Add New Project"
2. Select your `mental-logbook` repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

---

## Step 3: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose a database name (e.g., `mental-logbook-db`)
5. Select a region (closest to your users)
6. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option B: Neon Database (Alternative)

1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Add it to Vercel environment variables as `DATABASE_URL`

---

## Step 4: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

### Required Variables:

```env
# Database (automatically added if using Vercel Postgres)
DATABASE_URL=postgresql://...

# NextAuth.js (REQUIRED)
NEXTAUTH_SECRET=<generate-a-random-32-character-string>
NEXTAUTH_URL=https://your-app.vercel.app

# Optional: Custom domain
# NEXTAUTH_URL=https://yourdomain.com
```

### Generate NEXTAUTH_SECRET:

Run this command locally:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 5: Deploy

### 5.1 Initial Deployment

1. In Vercel, click **Deploy**
2. Wait for the build to complete (2-5 minutes)
3. Vercel will provide a URL (e.g., `mental-logbook.vercel.app`)

### 5.2 Run Database Migrations

After deployment, you need to initialize the database:

**Method 1: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
npx prisma generate
```

**Method 2: Using Prisma Studio**

```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

---

## Step 6: Verify Deployment

### 6.1 Test the Application

1. Visit your Vercel URL
2. Test registration: Create a new account
3. Test login
4. Create a daily check-in
5. Test each journal module
6. Verify analytics dashboard loads
7. Test therapist login
8. Test mobile responsiveness

### 6.2 Check Database

```bash
# View production database
npx prisma studio --browser none
```

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `myapp.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your domain

### 7.2 Update Environment Variables

```env
NEXTAUTH_URL=https://yourdomain.com
```

Redeploy after updating environment variables.

---

## Step 8: Post-Deployment Configuration

### 8.1 Enable Production Mode

Ensure `.env.production` or Vercel environment variables include:
```env
NODE_ENV=production
```

### 8.2 Monitor Application

- **Vercel Dashboard**: View deployment logs, analytics
- **Error Tracking**: Check Vercel Function Logs for errors
- **Database Monitoring**: Use Vercel Postgres dashboard or Neon console

---

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` is correctly set in Vercel
- Check database is running (Vercel Postgres/Neon)
- Ensure database allows connections from Vercel IPs

### Issue 2: NextAuth Error

**Error**: `[next-auth][error][NO_SECRET]`

**Solution**:
- Ensure `NEXTAUTH_SECRET` is set in Vercel environment variables
- Must be at least 32 characters
- Redeploy after adding

### Issue 3: Migration Errors

**Error**: `Migration failed to apply`

**Solution**:
```bash
# Reset and reapply migrations
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue 4: Build Errors

**Error**: TypeScript or build errors

**Solution**:
- Run `npm run build` locally first
- Fix any TypeScript errors
- Commit and push changes
- Vercel will auto-redeploy

---

## Maintenance

### Update Application

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel auto-deploys on push to `main`/`master`

### Database Migrations

When you update `schema.prisma`:

```bash
# Create migration locally
npx prisma migrate dev --name description_of_change

# Test locally
npm run dev

# Commit migration files
git add prisma/migrations
git commit -m "Add migration: description"
git push

# After deployment, run on production
vercel env pull .env.production
npx prisma migrate deploy
```

### Backup Database

**Vercel Postgres:**
- Automatic daily backups (retention varies by plan)
- Manual backup via Vercel dashboard

**Manual Backup:**
```bash
# Export data
npx prisma studio
# Or use pg_dump for PostgreSQL
```

---

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_SECRET` | Yes | Random 32+ char string | `generated-random-string` |
| `NEXTAUTH_URL` | Yes | Your app URL | `https://app.vercel.app` |
| `NODE_ENV` | Auto | Environment mode | `production` |

---

## Security Checklist

- ✅ `NEXTAUTH_SECRET` is unique and secure
- ✅ Environment variables are not committed to Git
- ✅ Database credentials are secure
- ✅ HTTPS is enabled (automatic with Vercel)
- ✅ Passwords are hashed (bcrypt)
- ✅ SQL injection protection (Prisma ORM)
- ✅ CSRF protection (NextAuth.js)

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment
- **NextAuth.js Deployment**: https://next-auth.js.org/deployment

---

## Quick Deploy Checklist

- [ ] GitHub repository is ready
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` configured
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `NEXTAUTH_URL` set to deployment URL
- [ ] Initial deployment successful
- [ ] Database migrations run
- [ ] Application tested in production
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

**Your Mental Health Logbook is now live! 🚀**
