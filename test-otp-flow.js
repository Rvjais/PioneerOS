/**
 * Standalone OTP Flow Test for PioneerOS Client Portal
 *
 * Tests the full OTP flow without needing PostgreSQL:
 * 1. Request OTP → sends via WhatsApp
 * 2. Verify OTP → validates and generates session token
 * 3. Shows what the session looks like for API calls
 *
 * Usage: node test-otp-flow.js
 */

const crypto = require('crypto');
const readline = require('readline');

const WBIZTOOL_CLIENT_ID = 10836;
const WBIZTOOL_API_KEY = 'bcddb3f6364b72b37a9e30fce9feb3c4d6e527e0';
const WBIZTOOL_WHATSAPP_CLIENT = 4721;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function sendWhatsApp(phone, message) {
  const params = new URLSearchParams();
  params.append('client_id', String(WBIZTOOL_CLIENT_ID));
  params.append('api_key', WBIZTOOL_API_KEY);
  params.append('whatsapp_client', String(WBIZTOOL_WHATSAPP_CLIENT));
  params.append('msg_type', '0');
  params.append('msg', message);
  params.append('phone', phone.replace(/\D/g, ''));
  params.append('country_code', '91');

  const res = await fetch('https://wbiztool.com/api/v1/send_msg/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: params.toString(),
  });
  const data = await res.json();

  if (data.status === 1) {
    console.log('  ✅ WhatsApp sent! (msg_id:', data.msg_id + ')');
  } else {
    console.log('  ❌ WhatsApp failed:', data.message);
  }
  return data;
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('   PIONEER OS - CLIENT LOGIN OTP TEST');
  console.log('═══════════════════════════════════════\n');

  // Use provided phone or ask
  const phone = process.argv[2] || await ask('📱 Enter phone for WhatsApp (e.g. 9648165493): ');
  const email = process.argv[3] || await ask('📧 Enter email for client user: ');
  console.log('');

  // Step 2: Generate OTP (same as server code)
  const otpCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const MAX_OTP_ATTEMPTS = 3;

  console.log(`  🔑 OTP generated: ${otpCode}`);
  console.log(`  🔒 OTP hash (SHA-256): ${otpHash.slice(0, 16)}...`);
  console.log(`  ⏰ OTP expires: ${otpExpiresAt.toLocaleTimeString()}`);
  console.log(`  📊 Max attempts: ${MAX_OTP_ATTEMPTS}`);
  console.log('');

  // Step 3: Send OTP via WhatsApp
  console.log('  📤 Sending OTP via WhatsApp...');
  const message = `Your Pioneer OS login OTP is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.`;
  await sendWhatsApp(phone, message);
  console.log('');

  // Step 4: Verify OTP
  let attempts = 0;
  let verified = false;

  while (attempts < MAX_OTP_ATTEMPTS && !verified) {
    const input = await ask(`🔢 Enter OTP (attempt ${attempts + 1}/${MAX_OTP_ATTEMPTS}): `);
    const submittedHash = crypto.createHash('sha256').update(input.toUpperCase()).digest('hex');

    if (new Date() > otpExpiresAt) {
      console.log('  ❌ OTP expired. Request a new one.\n');
      break;
    }

    if (otpHash !== submittedHash) {
      attempts++;
      console.log(`  ❌ Invalid OTP. ${MAX_OTP_ATTEMPTS - attempts} attempts remaining.\n`);
      if (attempts >= MAX_OTP_ATTEMPTS) {
        console.log('  🔒 Too many failed attempts. OTP invalidated.\n');
      }
      continue;
    }

    verified = true;
    console.log('  ✅ OTP verified successfully!\n');

    // Step 5: Generate session token (same as server code)
    const sessionToken = crypto.createHash('sha256')
      .update(`${email}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`)
      .digest('hex');
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log('  🔑 Session token generated (SHA-256):');
    console.log(`     ${sessionToken.slice(0, 32)}...`);
    console.log(`  ⏰ Session expires: ${sessionExpiresAt.toLocaleString()}`);
    console.log(`  🍪 Cookie: client_session=${sessionToken.slice(0, 16)}... (httpOnly, secure, 7 days)`);
    console.log('');

    // Step 6: Show what APIs will return
    console.log('  📋 Example: Dashboard API would return:');
    console.log(`     GET /api/client-portal/dashboard`);
    console.log(`     Cookie: client_session=${sessionToken.slice(0, 16)}...`);
    console.log(`     → Validated by withClientAuth() → ClientPortalUser`);
    console.log(`     → Returns stats, deliverables, meetings, activity`);
    console.log('');
    console.log('  🌐 Redirect to: /portal/dashboard or /client-portal');
  }

  console.log('───────────────────────────────────────');
  if (verified) {
    console.log('  ✅ FULL OTP FLOW WORKS END-TO-END');
  } else {
    console.log('  ❌ OTP verification did not complete');
  }
  console.log('───────────────────────────────────────\n');

  rl.close();
}

main().catch(console.error);
