#!/bin/bash
# ============================================================
#  PayOTP Database Backup Script
#  Run via cron: 0 3 * * * /var/www/payotp/scripts/backup.sh
# ============================================================

BACKUP_DIR="/var/backups/payotp"
DB_PATH="/var/www/payotp/data/payotp.db"
KEEP_DAYS=30

# Create backup dir
mkdir -p "$BACKUP_DIR"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/payotp_${TIMESTAMP}.db.gz"

# Backup with gzip
if [ -f "$DB_PATH" ]; then
  cp "$DB_PATH" "/tmp/payotp_backup.db"
  gzip -c "/tmp/payotp_backup.db" > "$BACKUP_FILE"
  rm "/tmp/payotp_backup.db"
  echo "✅ Backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "❌ Database not found: $DB_PATH"
  exit 1
fi

# Clean old backups
find "$BACKUP_DIR" -name "payotp_*.db.gz" -mtime +$KEEP_DAYS -delete
echo "🧹 Cleaned backups older than $KEEP_DAYS days"

# List current backups
echo ""
echo "📦 Current backups:"
ls -lh "$BACKUP_DIR"/payotp_*.db.gz 2>/dev/null | tail -5
