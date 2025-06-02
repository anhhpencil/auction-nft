/* eslint-disable no-restricted-syntax */
const CryptoJS = require('crypto-js');
const { system } = require('../config/config');

const password = `${system.secret}`;

/**
 * Encrypt with crypto-js library
 */

const encrypt = (plainText, credentails = password) => {
  let encryptedData = '';
  try {
    encryptedData = CryptoJS.AES.encrypt(plainText, credentails).toString();
  } catch (err) {
    console.log.error(err);
  }
  return encryptedData;
};

/**
 * Decrypt with crypto-js library
 */

const decrypt = (encryptedText, credentails = password) => {
  let plainText = '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, credentails);
    plainText = bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.log.error(err);
  }

  return plainText;
};

module.exports = {
  decrypt,
  encrypt,
};
