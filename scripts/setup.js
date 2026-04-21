#!/usr/bin/env node
// Setup script: Creates first admin user and configures settings
// Run: node scripts/setup.js

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const readline = require('readline');

const DB_PATH = path.join(__dirname, '..', 'data', 'payotp.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('🏪 PayOTP Setup Wizard\n');

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Check if admin exists
  const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (existingAdmin) {
    console.log('⚠️  Admin user already exists.');
    const overwrite = await ask('Create another admin? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      process.exit(0);
    }
  }

  // Get admin details
  const username = await ask('Admin username: ');
  const email = await ask('Admin email: ');
  const password = await ask('Admin password (min 6 chars): ');

  if (password.length < 6) {
    console.error('❌ Password too short!');
    process.exit(1);
  }

  // Check for existing
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    console.error('❌ Username or email already taken!');
    process.exit(1);
  }

  // Create admin
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const referralCode = 'ADMIN' + Math.random().toString(36).substring(2, 6).toUpperCase();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, referral_code, role)
    VALUES (?, ?, ?, ?, ?, 'admin')
  `).run(userId, username, email, passwordHash, referralCode);

  console.log(`\n✅ Admin created: ${username} (${email})`);
  console.log(`   Referral code: ${referralCode}`);

  // Configure PromptPay
  console.log('\n💳 PromptPay Configuration:');
  const ppNumber = await ask('PromptPay number (phone 10 digits or ID 13 digits, or skip): ');
  if (ppNumber.trim()) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('promptpay_number', ?)").run(ppNumber.trim());
    console.log('✅ PromptPay configured');
  }

  // Configure TrueMoney
  const twNumber = await ask('TrueMoney phone number (or skip): ');
  if (twNumber.trim()) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('truewallet_number', ?)").run(twNumber.trim());
    console.log('✅ TrueMoney configured');
  }

  // SMS-Activate API
  console.log('\n📱 SMS-Activate API (for OTP service):');
  const apiKey = await ask('API Key (or skip): ');
  if (apiKey.trim()) {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('otp_api_key', ?)").run(apiKey.trim());
    console.log('✅ SMS-Activate API configured');
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000');
  console.log('   3. Login with your admin account');
  console.log('   4. Add products in Admin > Products');
  console.log('   5. Add stock in Admin > Inventory');
  console.log('   6. Set up SMS Listener app on your phone');
  console.log('');

  db.close();
  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
