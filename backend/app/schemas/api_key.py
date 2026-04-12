from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    api_key: str
    api_secret: str
    exchange: str = "binance"


class ApiKeyResponse(BaseModel):
    id: str
    exchange: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True