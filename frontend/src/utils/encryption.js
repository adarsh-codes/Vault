
const encode = (text) => new TextEncoder().encode(text);
const decode = (buffer) => new TextDecoder().decode(buffer);

const toBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export const generateSalt = () =>
  crypto.getRandomValues(new Uint8Array(16));

export const generateIV = () =>
  crypto.getRandomValues(new Uint8Array(12));

export async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey("raw", encode(password), "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPassword(masterPassword, plainPassword) {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(masterPassword, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encode(plainPassword));

  return {
    encrypted_password: toBase64(encrypted),
    salt: toBase64(salt),
    iv: toBase64(iv),
  };
}

export async function decryptPassword(masterPassword, encrypted_password, salt, iv) {
  const key = await deriveKey(masterPassword, fromBase64(salt));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(iv) },
    key,
    fromBase64(encrypted_password)
  );
  return decode(decrypted);
}
