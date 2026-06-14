from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user import UserRepository
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, data: UserRegister) -> Token:
        if self.repo.email_exists(data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        if self.repo.username_exists(data.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        user = User(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
        )
        user = self.repo.create(user)
        token = create_access_token({"sub": str(user.id)})
        return Token(access_token=token, user=UserOut.model_validate(user))

    def login(self, data: UserLogin) -> Token:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        token = create_access_token({"sub": str(user.id)})
        return Token(access_token=token, user=UserOut.model_validate(user))
