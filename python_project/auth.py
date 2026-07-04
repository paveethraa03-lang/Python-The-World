import hashlib
import re

class Authenticator:
    """
    Handles user login, validation, and signup constraints.
    Passwords are securely stored as SHA-256 hashes inside SQLite.
    """
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def hash_password(password):
        """Hash a password using SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()

    def login(self, username, password):
        """
        Validate user credentials against the database.
        Returns (success_status, user_payload_or_error_message).
        """
        if not username.strip() or not password:
            return False, "Username and password fields cannot be empty."
            
        hashed_pwd = self.hash_password(password)
        success, result = self.db.authenticate_user(username, hashed_pwd)
        return success, result

    def register(self, username, password, confirm_password, role="Staff"):
        """
        Validate and register a new user.
        Includes password strength validation and duplicate username checks.
        """
        username = username.strip()
        if not username:
            return False, "Username cannot be empty."

        if len(username) < 3:
            return False, "Username must be at least 3 characters long."

        if not re.match("^[a-zA-Z0-9_]+$", username):
            return False, "Username can only contain alphanumeric characters and underscores."

        if not password:
            return False, "Password cannot be empty."

        if len(password) < 6:
            return False, "Password must be at least 6 characters long."

        if password != confirm_password:
            return False, "Passwords do not match."

        hashed_pwd = self.hash_password(password)
        success, message = self.db.register_user(username, hashed_pwd, role)
        return success, message
