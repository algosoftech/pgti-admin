const SECRET_KEY = "asqsdeasdfdwjkhfgjkdjhsfhksbkdfg"; // 32 character की key होनी चाहिए
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// **Key Generate Function**
const getKey = async () => {
  return crypto.subtle.importKey(
    "raw",
    ENCODER.encode(SECRET_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
};

// **Encrypt Function**
export const encryptData = async (plainText = "") => {
  // const key = await getKey();
  // const iv = crypto.getRandomValues(new Uint8Array(12)); // Random IV
  // const encrypted = await crypto.subtle.encrypt(
  //   { name: "AES-GCM", iv },
  //   key,
  //   ENCODER.encode(text)
  // );

  // return {
  //   iv: Array.from(iv), // IV को साथ भेजना ज़रूरी है
  //   data: Array.from(new Uint8Array(encrypted))
  // };

  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV is standard for AES-GCM

  const encoded = ENCODER.encode(plainText);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Split the ciphertext and authentication tag (tag = last 16 bytes)
  const encryptedBytes = new Uint8Array(encrypted);
  const tagLength = 16;
  const data = encryptedBytes.slice(0, encryptedBytes.length - tagLength);
  const tag = encryptedBytes.slice(encryptedBytes.length - tagLength);

  return {
    iv: Array.from(iv),
    data: Array.from(data),
    tag: Array.from(tag),
  };
};

// **Decrypt Function**
export const decryptData = async (encryptedObj = {}) => {
  try {
    if (!encryptedObj || typeof encryptedObj !== 'object' || Array.isArray(encryptedObj)) {
      return "";
    }
    const { iv, data, tag } = encryptedObj;
    if (!Array.isArray(data) || !Array.isArray(tag)) {
      return "";
    }

    const key = await getKey();
    // Rebuild buffer = ciphertext + tag
    const combined = new Uint8Array([...data, ...tag]);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      combined
    );

    return DECODER.decode(decrypted);
    
  } catch (error) {
    console.log('dec error  : ', error);
    return "";
  }
};