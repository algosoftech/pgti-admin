const crypto = require('crypto');

const SECRET_KEY = "asqsdeasdfdwjkhfgjkdjhsfhksbkdfg"; // 32-char = 256-bit key
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/**
 * Encrypt Data
 * @method
 * @param {String} plainText
 * @param {String} workingKey
 * @param {String} iv
 * @return {String}
 */
const encrypt = function (plainText, workingKey, iv) {
	let m = crypto.createHash('md5');
    m.update(workingKey);
   	let key = m.digest('buffer');
    
	let cipher = crypto.createCipheriv(process.env.crypto_algo, key, iv);
	let encoded = cipher.update(plainText, process.env.crypto_encoding, process.env.crypto_digest);
	encoded += cipher.final(process.env.crypto_digest);
    return encoded;
};

/**
 * Decrypt Data
 * @method
 * @param {String} encryptedText
 * @param {String} workingKey
 * @param {String} iv
 * @return {String}
 */
const decrypt = function (encText, workingKey, iv) {
    let m = crypto.createHash('md5');
    m.update(workingKey)
    let key = m.digest('buffer');
	let decipher = crypto.createDecipheriv(process.env.crypto_algo, key, iv);
    let decoded = decipher.update(encText, process.env.crypto_digest, process.env.crypto_encoding);
	decoded += decipher.final(process.env.crypto_encoding);
    return decoded;
};

const createMD5Hash = function (password) {
    const md5Hash = crypto.createHash('md5');
    return md5Hash.update(password).digest('hex');
};

const checkMD5Password = function (password, hashedPassword) {

    const md5Hash = crypto.createHash('md5');
    const encpass =  md5Hash.update(password).digest('hex');
    if(encpass === hashedPassword){
        return true;
    } else{
        return false;
    }
}

// --- Encrypt Function ---
const encryptData = (text) => {
  const key = Buffer.from(ENCODER.encode(SECRET_KEY)); // 32 bytes
  const iv = crypto.randomBytes(12); // 96-bit IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: Array.from(iv),
    data: Array.from(encrypted),
    tag: Array.from(tag) // tag भी भेजना ज़रूरी है (AES-GCM requirement)
  };
};

// --- Decrypt Function ---
const decryptData = (encryptedObj) => {
  const key = Buffer.from(ENCODER.encode(SECRET_KEY));
  const { iv, data, tag } = encryptedObj;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv)
  );

  decipher.setAuthTag(Buffer.from(tag));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data)),
    decipher.final()
  ]);

  return DECODER.decode(decrypted);
};

module.exports = {
    encrypt,
    decrypt,
    createMD5Hash,
    checkMD5Password,
    encryptData,
    decryptData
};