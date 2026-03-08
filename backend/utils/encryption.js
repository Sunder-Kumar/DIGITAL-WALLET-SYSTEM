const CryptoJS = require('crypto-js');
require('dotenv').config();

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'fintech-super-secret-123';

const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (hash) => {
    const bytes = CryptoJS.AES.decrypt(hash, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
