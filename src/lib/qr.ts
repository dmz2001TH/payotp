// QR PromptPay generation
// Generates Thai QR PromptPay payload (EMVCo standard)

export function generatePromptPayQR(phoneNumber: string, amount: number): string {
  // Clean phone number - remove non-digits, ensure starts with 0
  let phone = phoneNumber.replace(/\D/g, '');
  if (phone.startsWith('0') && phone.length === 10) {
    // Convert to format: 0066XXXXXXXXX (country code 66)
    phone = '0066' + phone.substring(1);
  } else if (phone.startsWith('66') && phone.length === 11) {
    phone = '00' + phone;
  }

  // EMVCo QR Payload
  const payload = [
    { id: '00', value: '01' },                                          // Payload Format Indicator
    { id: '01', value: '12' },                                          // Point of Initiation (12 = dynamic)
    { id: '29', value: buildMerchantAccountInfo(phone) },                // Merchant Account Info (PromptPay)
    { id: '53', value: '764' },                                          // Currency (764 = THB)
    { id: '54', value: amount.toFixed(2) },                              // Amount
    { id: '58', value: 'TH' },                                           // Country Code
    { id: '63', value: '' },                                             // CRC placeholder
  ];

  // Build payload string
  let payloadStr = payload.map(p => p.id + pad2(p.value.length) + p.value).join('');
  
  // Calculate CRC16
  const crc = crc16(payloadStr + '6304');
  payloadStr += '6304' + crc.toString(16).toUpperCase().padStart(4, '0');

  return payloadStr;
}

function buildMerchantAccountInfo(phone: string): string {
  // PromptPay tag 29 format:
  // 00 = AID (length varies)
  // 01 = phone number
  const aid = 'A000000677010111';
  const tag00 = '00' + pad2(aid.length) + aid;
  const tag01 = '01' + pad2(phone.length) + phone;
  return tag00 + tag01;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function crc16(data: string): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
  }
  }
  return crc;
}

// Generate unique amount with cent to identify depositor
export function generateUniqueAmount(baseAmount: number): { amount: number; code: string } {
  const code = Math.floor(Math.random() * 90 + 10).toString(); // 2-digit code 10-99
  const amount = baseAmount + parseInt(code) / 100; // e.g., 100.37
  return { amount: parseFloat(amount.toFixed(2)), code };
}

// TrueMoney Wallet link generation
export function generateTrueMoneyLink(phoneNumber: string, amount: number, message?: string): string {
  let phone = phoneNumber.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = phone.substring(1);
  }
  const msg = encodeURIComponent(message || '');
  return `https://tmn.app.link/?apn=com.truemoney.payment&isi=1001001001&ibi=com.truemoney.payment&link=https://www.truemoney.com/topup/${phone}/${amount}/${msg}`;
}
