# Foreko Deployment Guide

## Architecture Overview

- **Main App** (`custom-frontend/`): Authentication, marketing, payments
- **Dashboard App** (`app/`): User dashboard interface  
- **Database**: Shared PostgreSQL database between both apps

## Vercel Deployment Steps

### 1. Create Two Vercel Projects

#### Project 1: Main Application
- **Name**: `foreko-main` 
- **Framework**: Next.js
- **Root Directory**: `custom-frontend`
- **Domain**: `foreko.app` (your main domain)

#### Project 2: Dashboard Application  
- **Name**: `foreko-dashboard`
- **Framework**: Next.js
- **Root Directory**: `app`
- **Domain**: `dashboard-foreko.vercel.app` (or custom subdomain)

### 2. Environment Variables

#### Main App (`foreko-main`) Environment Variables:
```
DATABASE_URL=[your_postgresql_connection_string]
DASHBOARD_URL=https://dashboard-foreko.vercel.app
STRIPE_SECRET_KEY=[your_stripe_secret]
STRIPE_PUBLISHABLE_KEY=[your_stripe_publishable]
NEXTAUTH_SECRET=[random_secret_string]
NEXTAUTH_URL=https://foreko.app
EMAIL_SERVER_HOST=[your_smtp_host]
EMAIL_SERVER_PORT=[your_smtp_port]
EMAIL_SERVER_USER=[your_smtp_user]
EMAIL_SERVER_PASSWORD=[your_smtp_password]
EMAIL_FROM=[your_from_email]
```

#### Dashboard App (`foreko-dashboard`) Environment Variables:
```
NEXT_PUBLIC_MAIN_APP_URL=https://foreko.app
```

### 3. Custom Domains (Optional)
- Main app: `foreko.app` → `foreko-main.vercel.app`
- Dashboard: `dashboard.foreko.app` → `foreko-dashboard.vercel.app`

### 4. Database Setup
Both apps share the same `DATABASE_URL`, so users see consistent data.

## Deploy Commands

### Option A: Manual Deployment
1. Push your code to GitHub
2. Connect both Vercel projects to the same repository
3. Set the correct root directories and environment variables
4. Deploy both projects

### Option B: Automatic Deployment (Recommended)
The included GitHub Actions workflow will automatically deploy both apps when you push to main.

**Required GitHub Secrets:**
```
VERCEL_TOKEN=[your_vercel_token]
ORG_ID=[your_vercel_org_id]  
PROJECT_ID_MAIN=[main_app_project_id]
PROJECT_ID_DASHBOARD=[dashboard_app_project_id]
```

## Testing the Deployed Apps

1. Visit `https://foreko.app/sign-in`
2. Sign in with your credentials
3. You'll be redirected to `https://dashboard.foreko.app/dashboard` with auth data
4. Dashboard should show your user information and personalized data

## Troubleshooting

### Common Issues:
- **CORS errors**: Make sure both domains are configured in your database/API settings
- **Auth not working**: Verify environment variables are set correctly
- **Redirects failing**: Check `DASHBOARD_URL` and `NEXT_PUBLIC_MAIN_APP_URL` values

### Logs:
- Check Vercel function logs for both projects
- Verify database connections in both apps