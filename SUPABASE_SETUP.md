# SUPABASE SETUP GUIDE FOR MEGAPARK HOTEL

## Quick Start

### Step 1: Create a Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: megapark-hotel
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Wait for project to be created

### Step 2: Get Database Connection String
1. Go to Project Settings (gear icon)
2. Click "Database"
3. Find "Connection pooling" section
4. Copy the connection string:
   - Looks like: postgresql://postgres.[project-id]:[password]@aws-0-region.pooler.supabase.com:6543/postgres
5. Replace the DATABASE_URL in `.env` file

### Step 3: Setup Database Schema
```bash
cd backend
npm install
npm run db:setup
```

This will:
- Create all required tables
- Set up relationships
- Seed sample data (optional)

### Step 4: Configure Environment Variables
Edit `backend/.env`:
```
DATABASE_URL=postgresql://postgres.[your-project-id]:your_strong_password@aws-0-region.pooler.supabase.com:6543/postgres
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

### Step 5: Test Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit: http://localhost:5173

### Step 6: Test API Endpoints
Check API docs at: http://localhost:3000/api/docs

### Step 7: Prepare for Production

#### Update CORS Origins
Edit `backend/.env`:
```
CORS_ORIGIN=https://yourdomain.com
```

#### Generate New JWT Secrets
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

#### Set up Email Service
Choose one:
- **SendGrid**: Get API key from https://sendgrid.com
- **Gmail**: Generate app password from Google Account
- **AWS SES**: Configure AWS credentials

#### Setup Payment Processing
- **Stripe**: Get keys from https://stripe.com
- **M-Pesa**: Register at https://developer.safaricom.co.ke/

### Step 8: Deploy to Render (Recommended)

1. Push code to GitHub:
```bash
git add .
git commit -m "Setup for Supabase deployment"
git push
```

2. Go to https://render.com
3. Click "New" > "Web Service"
4. Connect your GitHub repository
5. Use `render.yaml` configuration (already included)
6. Set environment variables in Render dashboard

### Step 9: Configure Supabase Backups

1. In Supabase dashboard, go to Settings > Backups
2. Enable automated daily backups
3. Set retention period (30 days recommended)

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Rotate JWT secrets
- [ ] Enable database SSL (sslmode=require)
- [ ] Configure database backups
- [ ] Set up error tracking (Sentry)
- [ ] Enable email notifications
- [ ] Configure CORS for your domain only
- [ ] Enable rate limiting
- [ ] Test payment processing (stripe test mode)
- [ ] Test email notifications
- [ ] Monitor logs and errors

### Common Issues & Solutions

#### Issue: "Connection refused" when connecting to Supabase
**Solution**: 
- Check DATABASE_URL is correct
- Verify Supabase project is running
- Check firewall allows outbound connections to port 6543
- Ensure you're using the connection pooler URL, not direct URL

#### Issue: "CORS error" in browser
**Solution**:
- Update CORS_ORIGIN in .env to include your domain
- Restart backend after changing .env
- Verify frontend is making requests to correct API URL

#### Issue: Migrations fail
**Solution**:
- Check DATABASE_URL is correct
- Run `npm run migrate` to manually execute migrations
- Check logs in Supabase dashboard
- Ensure database user has correct permissions

#### Issue: Email not sending
**Solution**:
- Verify email credentials in .env
- Check email service (SendGrid, Gmail, etc.) is configured
- Review email logs in application dashboard
- Test with a simple transactional email first

### Support & Resources

- Supabase Docs: https://supabase.com/docs
- Render Docs: https://render.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Express.js: https://expressjs.com/
- React: https://react.dev/

### Next Steps

1. Test all features locally
2. Get SSL certificate for your domain
3. Configure custom domain in Render
4. Set up monitoring and alerts
5. Create backup and disaster recovery plan
6. Schedule regular security audits
