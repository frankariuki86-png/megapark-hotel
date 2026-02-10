# 🐘 PostgreSQL Database Setup Guide for Megapark Hotel

**Date**: February 10, 2026
**Platform**: Windows 10/11
**PostgreSQL Version**: 14+ (Recommended)

---

## 📋 TABLE OF CONTENTS

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Installation](#detailed-installation)
3. [Database Configuration](#database-configuration)
4. [Cloud Database Options](#cloud-database-options)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ QUICK START (5 minutes)

### **Option A: Use Cloud Database (Easiest - Recommended for Beginners)**

If you don't want to install PostgreSQL locally, use **Railway** (5 minutes setup):

```bash
# 1. Sign up: https://railway.app (free account)
# 2. Create new PostgreSQL database
# 3. Copy connection string
# 4. Update backend/.env
DATABASE_URL=postgres://username:password@host:port/dbname

# 5. Run migrations
cd backend
npm run db:setup  # Creates all tables

# Done! Database is ready
```

**Cost**: Free tier includes $5 credit/month  
**Go to**: [Railway.app Setup Guide](#railwayapp-setup-5-minutes) below

---

### **Option B: Local PostgreSQL Installation (Recommended for Development)**

**Step 1: Download & Install PostgreSQL**
- Go to: https://www.postgresql.org/download/windows/
- Download PostgreSQL 14 or latest
- Run installer, follow wizard
- **Remember the password you set for "postgres" user!**

**Step 2: Create Database**
```bash
# Open PostgreSQL Command Line (pgAdmin or psql)
createdb megapark
```

**Step 3: Update Configuration**
```bash
# Edit backend/.env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/megapark
```

**Step 4: Run Migrations**
```bash
cd backend
npm run db:setup  # Creates tables
```

**Done!** Your database is ready to use.

---

## 🖥️ DETAILED INSTALLATION

### **Windows Installation (Step-by-Step)**

#### **Step 1: Download PostgreSQL**

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose PostgreSQL **14** or **15** (latest stable)
4. Download the installer

#### **Step 2: Run Installer**

1. Double-click the installer
2. Follow the Setup Wizard:
   - Choose Installation Directory (default is fine)
   - Select Components:
     - ✅ PostgreSQL Server
     - ✅ pgAdmin 4 (database GUI)
     - ✅ Command Line Tools
     - ✅ Stack Builder (optional)
   - Choose Data Directory (default is fine)
   - **Set "postgres" user password** (save this!)
   - Port: **5432** (default)
   - Locale: Select your country
   - Configure service to start automatically

3. Click Next → Finish

#### **Step 3: Verify Installation**

Open Command Prompt and test:
```bash
psql --version
# Should show: psql (PostgreSQL) 14.x
```

---

### **Create Megapark Database**

#### **Method 1: Using pgAdmin (GUI - Easiest)**

1. Start pgAdmin from Windows menu or:
   ```bash
   pgAdmin 4
   ```

2. Login (default: postgres / password you set)

3. Right-click **Databases** → Create → Database

4. Name: `megapark`

5. Click Save

#### **Method 2: Using Command Line (psql)**

```bash
# Open Command Prompt
psql -U postgres

# At the psql prompt, type:
CREATE DATABASE megapark;

# Verify it was created:
\l

# Exit psql:
\q
```

---

## 🔧 DATABASE CONFIGURATION

### **Update Backend Environment File**

**File**: `backend/.env`

```bash
# PostgreSQL Connection
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/megapark

# Replace YOUR_PASSWORD with the password you set during PostgreSQL installation
# Example: DATABASE_URL=postgres://postgres:mypassword@localhost:5432/megapark
```

### **Test Database Connection**

```bash
cd backend

# Test connection
node -e "const { Client } = require('pg'); const c = new Client(process.env.DATABASE_URL); c.connect().then(() => { console.log('✓ Database connected!'); c.end(); }).catch(e => console.error('✗ Connection failed:', e.message));"
```

Expected output:
```
✓ Database connected!
```

### **Run Database Migrations**

Migrations create all the necessary tables:

```bash
cd backend

# Create tables and indexes
npm run migrate

# Output should show:
# ✓ Connected to database
# ✓ Creating tables...
# ✓ Migration completed successfully
```

### **Optional: Seed Sample Data**

```bash
cd backend

# Add sample menu items, orders, rooms, etc.
npm run seed

# Output should show:
# ✓ Seeding menu items...
# ✓ Seeding food orders...
# ✓ Etc.
```

---

## ☁️ CLOUD DATABASE OPTIONS

### **Railway.app Setup (5 minutes)**

**Why Railway?**
- ✅ Free tier with $5 credit/month
- ✅ Auto-scaling
- ✅ Backups included
- ✅ SQL, Redis, Node.js all supported
- ✅ Easy deployment

**Setup Steps:**

1. **Sign Up**
   - Go to: https://railway.app
   - Click "Create Account"
   - Sign up with GitHub or email

2. **Create PostgreSQL Database**
   - Click "New Project"
   - Search for "PostgreSQL"
   - Add PostgreSQL

3. **Get Connection String**
   - Click on PostgreSQL service
   - Click "Connect" tab
   - Copy the connection string under "Postgres Connection URL"
   - Format: `postgres://user:password@host:port/railway`

4. **Update Backend Configuration**

   **File**: `backend/.env`
   ```bash
   DATABASE_URL=postgres://user:password@host:port/railway
   ```

5. **Run Migrations from Your Local Machine**
   ```bash
   cd backend
   npm run migrate  # Creates tables
   npm run seed     # Optional: Add sample data
   ```

6. **Test Connection**
   ```bash
   # Should see: ✓ Database connected!
   node -e "const { Client } = require('pg'); const c = new Client(process.env.DATABASE_URL); c.connect().then(() => { console.log('✓ Railway database connected!'); c.end(); }).catch(e => console.error('✗ Connection failed:', e.message));"
   ```

---

### **Other Cloud Options**

| Provider | Price | Setup Time | Features |
|----------|-------|-----------|----------|
| **Railway** | Free tier + $5 credit | 5 min | Auto-scaling, backups |
| **Render** | $10-20/month | 10 min | Great UI, backups |
| **AWS RDS** | $15+/month | 15 min | Powerful, flexible |
| **DigitalOcean** | $12+/month | 10 min | Good performance |
| **Heroku** | Now paid-only | 5 min | User-friendly |

**Recommendation**: Railway for development, AWS RDS for production scale

---

## ✅ TESTING & VERIFICATION

### **Test 1: Verify Tables Created**

```bash
cd backend

# Connect to database and list tables
psql -U postgres -d megapark -c "\dt"

# Should show:
# public | bookings       | table | postgres
# public | events         | table | postgres
# public | food_orders    | table | postgres
# public | menu_items     | table | postgres
# public | rooms          | table | postgres
# public | users          | table | postgres
```

### **Test 2: Check Sample Data**

```bash
# If you ran "npm run seed", verify data exists
psql -U postgres -d megapark -c "SELECT COUNT(*) FROM menu_items;"

# Should return: count
#        10
#  (1 row)
```

### **Test 3: Start Backend and Test API**

```bash
cd backend
npm run dev

# Backend should show:
# ✓ Connected to Postgres
# ✓ Server started on port 3000
```

### **Test 4: API Test**

```bash
# In another terminal, test the menu endpoint
curl http://localhost:3000/api/menu

# Should return:
# [
#   {"id":"menu-001","name":"Nyama Choma","price":850,...},
#   {"id":"menu-002","name":"Ugali with Sukuma Wiki","price":350,...},
#   ...
# ]
```

### **Test 5: Login and Check Admin Dashboard**

1. Go to: http://localhost:5173/admin/login
2. Email: `admin@megapark.com`
3. Password: `admin123`
4. Verify you see existing orders from the database
5. Try creating a new order
6. Verify it appears in the database

---

## 🐛 TROUBLESHOOTING

### **Issue: "Connection refused"**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   # Windows: Check Services
   # Or restart PostgreSQL:
   sc start postgresql-x64-14
   ```

2. Check if your DATABASE_URL is correct
   ```bash
   echo %DATABASE_URL%  # Windows
   # Should show: postgres://postgres:password@localhost:5432/megapark
   ```

3. Verify password is correct
   ```bash
   psql -U postgres -h localhost
   # If it fails, password is wrong
   ```

---

### **Issue: "password authentication failed"**

**Solutions**:
1. Reset PostgreSQL password:
   ```bash
   # Windows Command Prompt (as Administrator)
   psql -U postgres -h localhost
   # Enter current password
   
   # Or use pgAdmin:
   # Right-click "postgres" user → Properties → Change password
   ```

2. Update .env with correct password:
   ```bash
   DATABASE_URL=postgres://postgres:CORRECT_PASSWORD@localhost:5432/megapark
   ```

---

### **Issue: "database 'megapark' does not exist"**

**Solutions**:
```bash
# Create the database
createdb -U postgres megapark

# Or with pgAdmin:
# Right-click Databases → Create → Database → megapark
```

---

### **Issue: Migrations Failed**

**Solutions**:
1. Check for error messages in the output
2. Verify database exists:
   ```bash
   psql -U postgres -l | grep megapark
   ```

3. Run migrations manually:
   ```bash
   cd backend
   node scripts/migrate.js
   ```

4. Check if migrations are idempotent (safe to run multiple times)
   ```bash
   npm run migrate  # Safe to run multiple times
   ```

---

### **Issue: "Port 5432 already in use"**

**Solutions**:
1. Change PostgreSQL port to 5433:
   ```bash
   # Windows: Stop PostgreSQL, change port in postgresql.conf
   # Then update .env:
   DATABASE_URL=postgres://postgres:password@localhost:5433/megapark
   ```

2. Or kill existing process:
   ```bash
   # Find process using port 5432
   netstat -ano | findstr :5432
   
   # Kill it (replace PID with the number)
   taskkill /PID 1234 /F
   ```

---

## 📋 CHECKLIST

- [ ] PostgreSQL installed and running
- [ ] Database `megapark` created
- [ ] `backend/.env` has DATABASE_URL set
- [ ] `npm run migrate` completed successfully
- [ ] `npm run seed` completed successfully (optional)
- [ ] `curl http://localhost:3000/api/menu` returns data
- [ ] Backend shows "✓ Connected to Postgres"
- [ ] Frontend can login and see orders from database
- [ ] Can create new order and see it in database

---

## 🎯 NEXT STEPS

After database setup:

1. **Test Everything**
   - [ ] Login to admin dashboard
   - [ ] View orders from database
   - [ ] Create new menu item
   - [ ] Place new order as customer
   - [ ] Approve order as admin

2. **Backup Your Database** (Important!)
   ```bash
   # Daily backups
   pg_dump -U postgres megapark > backup.sql
   ```

3. **Move to Deployment** (See DEPLOYMENT_READINESS_REPORT.md)

---

## 📚 REFERENCE

### **Useful PostgreSQL Commands**

```bash
# Connect to database
psql -U postgres -d megapark

# List all databases
\l

# List all tables
\dt

# Describe table
\d menu_items

# Count records
SELECT COUNT(*) FROM menu_items;

# View sample data
SELECT * FROM menu_items LIMIT 5;

# Exit psql
\q
```

### **Useful npm Scripts**

```bash
cd backend

npm run dev       # Start backend server (hot reload)
npm run start     # Start backend server (production)
npm run migrate   # Create database schema
npm run seed      # Add sample data
npm run test      # Run tests
npm run lint      # Check code style
```

---

## 💡 DATABASE ARCHITECTURE

Your database has these tables:

```sql
CREATE TABLE menu_items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  category VARCHAR(50),
  availability BOOLEAN,
  ...
);

CREATE TABLE food_orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255),
  items JSON,
  total_amount DECIMAL(10,2),
  status VARCHAR(50),  -- pending, confirmed, preparing, ready, delivered
  ...
);

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),  -- admin, staff, user
  ...
);

CREATE TABLE rooms (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  capacity INT,
  ...
);

CREATE TABLE bookings (
  id VARCHAR(64) PRIMARY KEY,
  room_id VARCHAR(64),
  guest_name VARCHAR(255),
  check_in DATE,
  check_out DATE,
  ...
);

CREATE TABLE events (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(100),
  guest_count INT,
  ...
);
```

---

## 🔒 SECURITY TIPS

✅ **Do**:
- ✅ Use strong PostgreSQL password
- ✅ Keep DATABASE_URL in .env (never in code)
- ✅ Use HTTPS in production
- ✅ Regular backups (daily)
- ✅ Monitor database performance

❌ **Don't**:
- ❌ Use "password" as password
- ❌ Commit .env file to Git
- ❌ Use default credentials in production
- ❌ Expose DATABASE_URL publicly
- ❌ Run migrations in production without backup

---

## ❓ FAQ

**Q: Can I switch from SQLite to PostgreSQL?**
A: Yes! Just set DATABASE_URL and run migrations. Your data stays in the old store until you manually migrate.

**Q: Do I need to run migrations again?**
A: No, they're idempotent (safe to run multiple times). Tables are only created if they don't exist.

**Q: Where is my data stored?**
A: In PostgreSQL database files (usually at `C:\Program Files\PostgreSQL\14\data` on Windows)

**Q: Can I backup my database?**
A: Yes! Use `pg_dump`:
```bash
pg_dump -U postgres megapark > backup.sql
# To restore:
psql -U postgres megapark < backup.sql
```

**Q: What if I mess up?**
A: Just recreate the database:
```bash
dropdb -U postgres megapark
createdb -U postgres megapark
npm run migrate
npm run seed
```

---

## 🎉 SUCCESS!

Once you see:
```
✓ Connected to Postgres
✓ Server started on port 3000
```

Your database is ready for your Megapark Hotel system!

**You've reached 9/10 deployment readiness!** 🚀

