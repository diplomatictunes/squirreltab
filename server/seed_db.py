from database import SessionLocal, User

def seed():
    db = SessionLocal()
    # Check if test key already exists
    exists = db.query(User).filter(User.api_key == "test-key-123").first()
    if not exists:
        test_user = User(api_key="test-key-123")
        db.add(test_user)
        db.commit()
        print("Success: Created test user with API key: test-key-123")
    else:
        print("Test user already exists.")
    db.close()

if __name__ == "__main__":
    seed()
