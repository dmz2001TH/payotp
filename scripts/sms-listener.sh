#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  PayOTP SMS Listener — Termux (Android)
#  Detects bank SMS and sends to webhook for auto-confirm
#  Phone: iQOO 12 5G
# ============================================================

# ---- CONFIG ----
WEBHOOK_URL="https://your-domain.com/api/admin/sms-confirm"
API_KEY="your-sms-webhook-key-here"  # Must match sms_webhook_key in settings

# Bank SMS patterns (Thai banks)
# Format: grep pattern to match incoming SMS
BANK_PATTERNS=(
  "เงินเข้า"
  "received"
  "ได้รับเงิน"
  "โอนเงินเข้า"
  "PromptPay"
  "K PLUS"
  "SCB"
  "Krungthai"
  "BBL"
  "BAAC"
  "TTB"
  "UOB"
  "CIMB"
  "กรุงเทพ"
  "กสิกร"
  "ไทยพาณิชย์"
  "กรุงไทย"
)

# Amount extraction regex (Thai bank formats)
AMOUNT_PATTERN='([0-9,]+\.?[0-9]*)\s*(?:บ\.?|บาท|THB|Baht)'

echo "🔔 PayOTP SMS Listener started"
echo "   Webhook: $WEBHOOK_URL"
echo "   Patterns: ${#BANK_PATTERNS[@]} bank patterns loaded"
echo ""

# Function to extract amount from SMS
extract_amount() {
  local msg="$1"

  # Try pattern: XX,XXX.XX baht / บาท / บ.
  if echo "$msg" | grep -oP '[\d,]+\.\d{2}(?=\s*(บ\.?|บาท|THB|Baht))' | head -1; then
    return 0
  fi

  # Try pattern: amount XXXX.XX
  if echo "$msg" | grep -oP '(?:amount|ยอด|เงิน)\s*[:=]?\s*([\d,]+\.?\d*)' | grep -oP '[\d,]+\.?\d*' | head -1; then
    return 0
  fi

  # Try pattern: any decimal number > 10
  echo "$msg" | grep -oP '\b\d{2,6}\.\d{2}\b' | head -1
}

# Function to send to webhook
send_webhook() {
  local amount="$1"
  local raw_sms="$2"

  # Remove commas from amount
  amount=$(echo "$amount" | tr -d ',')

  echo "💰 Detected deposit: ฿$amount"
  echo "   SMS: ${raw_sms:0:80}..."

  response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"amount\": $amount,
      \"timestamp\": \"$(date -Iseconds)\",
      \"api_key\": \"$API_KEY\"
    }")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    echo "   ✅ Webhook sent successfully"
    echo "   Response: $body"
  else
    echo "   ❌ Webhook failed (HTTP $http_code)"
    echo "   Response: $body"
  fi
  echo ""
}

# Function to check if SMS is from a bank
is_bank_sms() {
  local msg="$1"
  for pattern in "${BANK_PATTERNS[@]}"; do
    if echo "$msg" | grep -qi "$pattern"; then
      return 0
    fi
  done
  return 1
}

# ---- MAIN LOOP ----
echo "📡 Listening for SMS..."
echo "   Press Ctrl+C to stop"
echo ""

# Create temp file to track processed SMS
PROCESSED_FILE="/data/data/com.termux/files/usr/tmp/payotp-processed.txt"
touch "$PROCESSED_FILE"

while true; do
  # Read all SMS from content provider
  sms_list=$(content query --uri content://sms/inbox \
    --projection "_id,address,body,date" \
    --sort "date DESC" \
    --limit 5 2>/dev/null)

  if [ -z "$sms_list" ]; then
    # Fallback: use termux-sms-list if available
    if command -v termux-sms-list &>/dev/null; then
      sms_list=$(termux-sms-list -l 5 2>/dev/null)
    fi
  fi

  # Process each SMS
  while IFS= read -r line; do
    # Extract SMS ID to avoid reprocessing
    sms_id=$(echo "$line" | grep -oP '(?<=_id=)\d+' | head -1)

    if [ -z "$sms_id" ]; then
      continue
    fi

    # Skip if already processed
    if grep -q "^${sms_id}$" "$PROCESSED_FILE" 2>/dev/null; then
      continue
    fi

    # Extract body
    body=$(echo "$line" | grep -oP '(?<=body=).*' | head -1)

    if [ -z "$body" ]; then
      continue
    fi

    # Check if it's a bank SMS
    if is_bank_sms "$body"; then
      amount=$(extract_amount "$body")
      if [ -n "$amount" ]; then
        send_webhook "$amount" "$body"
        echo "$sms_id" >> "$PROCESSED_FILE"
      fi
    fi
  done <<< "$sms_list"

  # Wait 5 seconds before next check
  sleep 5
done
