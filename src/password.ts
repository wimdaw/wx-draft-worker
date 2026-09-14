/**
 * 密码哈希：PBKDF2-HMAC-SHA256（WebCrypto 原生实现）
 * 每个用户独立随机盐，哈希与盐以十六进制分开存 users 表，便于后续调整参数。
 */

const ITERATIONS = 100_000
const KEY_BITS = 256
const SALT_BYTES = 16

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(Math.floor(hex.length / 2))
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_BITS,
  )
  return toHex(new Uint8Array(bits))
}

/** 生成随机盐（十六进制） */
export function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)))
}

/** 计算密码哈希；传入 saltHex 则复用该盐（用于校验） */
export async function hashPassword(
  password: string,
  saltHex?: string,
): Promise<{ hash: string; salt: string }> {
  if (saltHex) {
    return { hash: await derive(password, fromHex(saltHex)), salt: saltHex }
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  return { hash: await derive(password, salt), salt: toHex(salt) }
}

/** 定长比较，避免时序泄露 */
export async function verifyPassword(password: string, hash: string, saltHex: string): Promise<boolean> {
  if (!hash || !saltHex) return false
  const got = await derive(password, fromHex(saltHex))
  if (got.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i)
  return diff === 0
}
