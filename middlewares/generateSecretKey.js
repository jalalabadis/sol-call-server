const CryptoJS = require('crypto-js');

const generateSecretKey=()=> {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(array);
  } else {
    // Node.js environment
    require('crypto').randomFillSync(array);
  }
  const hexString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return CryptoJS.enc.Hex.parse(hexString).toString();
}

module.exports = generateSecretKey