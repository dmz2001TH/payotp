#!/bin/bash
# ============================================================
#  PayOTP Deploy Script
#  Usage: ./scripts/deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/payotp"
REPO="https://github.com/dmz2001TH/payotp.git"
DOMAIN="your-domain.com"

echo "🚀 PayOTP Deploy Script"
echo "========================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root: sudo ./scripts/deploy.sh"
  exit 1
fi

# 1. Install dependencies
echo ""
echo "📦 Step 1: Installing system dependencies..."
apt update && apt install -y nginx certbot python3-certbot-nginx

# Install Node.js 22 if not present
if ! command -v node &>/dev/null; then
  echo "   Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi

# Install PM2
if ! command -v pm2 &>/dev/null; then
  echo "   Installing PM2..."
  npm install -g pm2
fi

# 2. Clone or update repo
echo ""
echo "📥 Step 2: Setting up application..."
if [ -d "$APP_DIR" ]; then
  echo "   Updating existing installation..."
  cd "$APP_DIR"
  git pull
else
  echo "   Cloning repository..."
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# 3. Install npm dependencies
echo ""
echo "📚 Step 3: Installing npm dependencies..."
npm ci --production=false

# 4. Build
echo ""
echo "🔨 Step 4: Building application..."
npm run build

# 5. Setup data directory
mkdir -p data
mkdir -p /var/log/payotp

# 6. Setup environment
if [ ! -f "$APP_DIR/.env" ]; then
  echo ""
  echo "⚙️  Step 5: Creating .env file..."
  JWT_SECRET=$(openssl rand -hex 32)
  cat > "$APP_DIR/.env" << EOF
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
EOF
  echo "   JWT_SECRET generated and saved to .env"
  echo "   ⚠️  Remember to configure: promptpay_number, sms_webhook_key, etc."
fi

# 7. Setup Nginx
echo ""
echo "🌐 Step 6: Setting up Nginx..."
if [ ! -f "/etc/nginx/sites-available/payotp.conf" ]; then
  cp "$APP_DIR/deploy/nginx.conf" "/etc/nginx/sites-available/payotp.conf"
  sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/payotp.conf
  ln -sf /etc/nginx/sites-available/payotp.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  echo "   Nginx configured for $DOMAIN"
else
  echo "   Nginx config already exists, skipping"
fi

# 8. Setup SSL
echo ""
echo "🔒 Step 7: Setting up SSL..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
  echo "   SSL certificate installed"
else
  echo "   SSL certificate already exists"
fi

# 9. Start with PM2
echo ""
echo "🟢 Step 8: Starting application..."
pm2 delete payotp 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# 10. Setup backup cron
echo ""
echo "💾 Step 9: Setting up backups..."
chmod +x "$APP_DIR/scripts/backup.sh"
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 3 * * * $APP_DIR/scripts/backup.sh >> /var/log/payotp/backup.log 2>&1") | crontab -

# 11. Run setup wizard
echo ""
echo "🔧 Step 10: Running setup wizard..."
cd "$APP_DIR"
npm run setup || echo "   Setup wizard skipped (run manually: npm run setup)"

echo ""
echo "============================================"
echo "✅ Deploy complete!"
echo ""
echo "   🌐 URL: https://$DOMAIN"
echo "   📁 App:  $APP_DIR"
echo "   📋 Logs: pm2 logs payotp"
echo "   🔄 Restart: pm2 restart payotp"
echo "   💾 Backup: $APP_DIR/scripts/backup.sh"
echo ""
echo "⚠️  Next steps:"
echo "   1. Run: cd $APP_DIR && npm run setup"
echo "   2. Set PromptPay number in admin panel"
echo "   3. Configure SMS webhook key"
echo "============================================"
