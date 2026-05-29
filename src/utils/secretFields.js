import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKeyBuffer() {
  const raw = process.env.APP_SECRET_FIELDS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "APP_SECRET_FIELDS_ENCRYPTION_KEY no configurada (64 caracteres hex = 32 bytes; genera con: openssl rand -hex 32)"
    );
  }
  const buf = Buffer.from(raw.trim(), "hex");
  if (buf.length !== 32) {
    throw new Error("APP_SECRET_FIELDS_ENCRYPTION_KEY debe ser exactamente 64 caracteres hexadecimales");
  }
  return buf;
}

/**
 * Cifra texto UTF-8. Devuelve base64 (iv + authTag + ciphertext).
 * @param {string | null | undefined} plain
 * @returns {string | null}
 */
export function encryptSecret(plain) {
  if (plain == null || plain === "") return null;
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/**
 * Descifra un valor guardado con encryptSecret.
 * @param {string | null | undefined} blob
 * @returns {string | null}
 */
export function decryptSecret(blob) {
  if (blob == null || blob === "") return null;
  const key = getKeyBuffer();
  const buf = Buffer.from(String(blob), "base64");
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Valor cifrado inválido");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const data = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
