# Deployment Guide for justklick.co.in

This guide explains how to deploy the Student Data application with a split architecture:
- **Frontend**: React + Vite on Hostinger (https://justklick.co.in)
- **Backend**: Django REST API on VPS (https://api.justklick.co.in)

## Architecture Overview

```
[User Browser]
     |
     +---> https://justklick.co.in (React Frontend - Hostinger)
     |           |
     |           +---> API calls to https://api.justklick.co.in
     |
     +---> https://api.justklick.co.in (Django Backend - VPS)
                 |
                 +---> PostgreSQL Database
```

---

## Part 1: VPS Setup for Django Backend (api.justklick.co.in)

### 1. SSH into VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git postgresql postgresql-contrib -y
```

### 3. Set up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE schooldata;
CREATE USER schooldata_user WITH PASSWORD 'your-secure-password';
ALTER ROLE schooldata_user SET client_encoding TO 'utf8';
ALTER ROLE schooldata_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE schooldata_user SET timezone TO 'Asia/Kolkata';
GRANT ALL PRIVILEGES ON DATABASE schooldata TO schooldata_user;
\q
```

### 4. Create Project Directory and Clone Repository

```bash
# Create project directory
sudo mkdir -p /var/www/api.justklick.co.in
sudo chown $USER:$USER /var/www/api.justklick.co.in

# Clone your repository (or upload files)
cd /var/www/api.justklick.co.in
git clone YOUR_REPO_URL . 
# OR upload files via scp/sftp

# Project structure should be:
# /var/www/api.justklick.co.in/
#   backend/
#     schooldata/
#     students/
#     manage.py
#     requirements.txt
#     .env
#   venv/
```

### 5. Set up Python Virtual Environment

```bash
cd /var/www/api.justklick.co.in
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

### 6. Configure Environment Variables

Create `.env` file in the backend directory:

```bash
nano /var/www/api.justklick.co.in/backend/.env
```

Add the following content:

```env
# Django settings
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-change-this

# Allowed hosts (comma-separated)
ALLOWED_HOSTS=localhost,127.0.0.1,api.justklick.co.in

# Database settings
USE_SQLITE=false
DB_NAME=schooldata
DB_USER=schooldata_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
```

Generate a secure secret key:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 7. Run Migrations and Collect Static Files

```bash
cd /var/www/api.justklick.co.in/backend
source ../venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
```

### 8. Create Media Directory

```bash
mkdir -p /var/www/api.justklick.co.in/backend/media
sudo chown -R www-data:www-data /var/www/api.justklick.co.in/backend/media
```

### 9. Set up Gunicorn Systemd Service

Create the service file:

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Add the following content:

```ini
[Unit]
Description=Gunicorn daemon for Django API (api.justklick.co.in)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api.justklick.co.in/backend
ExecStart=/var/www/api.justklick.co.in/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/var/www/api.justklick.co.in/backend/gunicorn.sock \
          schooldata.wsgi:application
Environment="PATH=/var/www/api.justklick.co.in/venv/bin"
EnvironmentFile=/var/www/api.justklick.co.in/backend/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
```

### 10. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/api.justklick.co.in
```

Add the following content:

```nginx
server {
    listen 80;
    server_name api.justklick.co.in;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/api.justklick.co.in/backend/gunicorn.sock;
    }

    # Serve static files
    location /static/ {
        alias /var/www/api.justklick.co.in/backend/staticfiles/;
    }

    # Serve media files
    location /media/ {
        alias /var/www/api.justklick.co.in/backend/media/;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/api.justklick.co.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 11. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/api.justklick.co.in
sudo chmod -R 755 /var/www/api.justklick.co.in
```

### 12. Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.justklick.co.in
```

The certbot will automatically modify your Nginx config to include SSL.

### 13. Configure Firewall (UFW)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Part 2: Frontend Deployment on Hostinger (justklick.co.in)

### 1. Configure Frontend Environment

Update `student-form/.env.production`:

```env
VITE_API_URL=https://api.justklick.co.in
```

### 2. Build the React Application

```bash
cd student-form
npm install
npm run build
```

This creates a `dist` folder with optimized static files.

### 3. Upload to Hostinger

1. Connect to Hostinger via FTP/SFTP or use File Manager
2. Upload all contents of `dist/` folder to `public_html/` directory
3. Ensure `.htaccess` is included for SPA routing

### 4. Create .htaccess for SPA Routing

Create `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Part 3: DNS Configuration

### A Records (Hostinger DNS Panel)

| Type    | Name              | Value              | TTL   |
|---------|-------------------|--------------------|-------|
| A       | @                 | HOSTINGER_IP       | 14400 |
| A       | www               | HOSTINGER_IP       | 14400 |
| A       | api               | VPS_IP             | 14400 |

---

## Verification

After deployment, verify:

1. **Backend API**: Visit `https://api.justklick.co.in/admin/` - Django admin should load
2. **API Endpoint**: Visit `https://api.justklick.co.in/api/students/` - Should return JSON
3. **Frontend**: Visit `https://justklick.co.in` - React app should load
4. **Integration**: Submit form on frontend - data should save to backend

---

## Quick Reference Commands

### Backend (VPS)

```bash
# Restart Gunicorn
sudo systemctl restart gunicorn

# Check Gunicorn status
sudo systemctl status gunicorn

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t

# Renew SSL certificate
sudo certbot renew --dry-run
```

### Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d schooldata

# Backup database
pg_dump -U schooldata_user schooldata > backup.sql

# Restore database
psql -U schooldata_user schooldata < backup.sql
```

---

## Environment Variables Summary

### Frontend (.env.production)
```env
VITE_API_URL=https://api.justklick.co.in
```

### Backend (.env on VPS)
```env
DEBUG=False
SECRET_KEY=<your-secure-key>
ALLOWED_HOSTS=localhost,127.0.0.1,api.justklick.co.in
USE_SQLITE=false
DB_NAME=schooldata
DB_USER=schooldata_user
DB_PASSWORD=<your-secure-password>
DB_HOST=localhost
DB_PORT=5432
```

---

## Troubleshooting

### 1. CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in `settings.py` includes `https://justklick.co.in`
- Check that `django-cors-headers` is in `INSTALLED_APPS` and middleware

### 2. Static Files Not Loading
- Run `python manage.py collectstatic --noinput`
- Check Nginx static file alias path

### 3. 502 Bad Gateway
- Check if Gunicorn is running: `sudo systemctl status gunicorn`
- Verify socket file exists: `ls -la /var/www/api.justklick.co.in/backend/gunicorn.sock`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### 4. Permission Denied
- Fix permissions: `sudo chown -R www-data:www-data /var/www/api.justklick.co.in`

### 5. Database Connection Error
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`

---

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] PostgreSQL user has limited privileges
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication (disable password auth)
- [ ] Regular database backups configured
- [ ] Security headers enabled in Django settings

---

## Monitoring & Maintenance

Consider setting up:
- **Log rotation**: Configure logrotate for application logs
- **Monitoring**: Prometheus/Grafana or Uptime Kuma
- **Error tracking**: Sentry for Django
- **Backups**: Automated daily PostgreSQL backups
- **SSL renewal**: Certbot auto-renewal (usually automatic)
