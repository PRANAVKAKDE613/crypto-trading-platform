from cryptography.fernet import Fernet
from app.core.config import settings


def get_fernet() -> Fernet:
    return Fernet(settings.FERNET_KEY.encode())


def encrypt(plain_text: str) -> str:
    f = get_fernet()
    return f.encrypt(plain_text.encode()).decode()


def decrypt(cipher_text: str) -> str:
    f = get_fernet()
    return f.decrypt(cipher_text.encode()).decode()