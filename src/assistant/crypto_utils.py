from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64

KEY_SIZE = 32  # AES-256


def generate_key() -> bytes:
    """Generate a random AES-256 key."""
    return get_random_bytes(KEY_SIZE)


def encrypt(key: bytes, data: str) -> str:
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(data.encode('utf-8'))
    return base64.b64encode(cipher.nonce + tag + ciphertext).decode('utf-8')


def decrypt(key: bytes, data: str) -> str:
    raw = base64.b64decode(data.encode('utf-8'))
    nonce = raw[:16]
    tag = raw[16:32]
    ciphertext = raw[32:]
    cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode('utf-8')
