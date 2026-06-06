import bcrypt

password = "Mani@12345"
password_bytes = password.encode('utf-8')

print(f"Password: {password}")
print(f"Length: {len(password)}")
print(f"Bytes: {len(password_bytes)}")

# Test bcrypt directly
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password_bytes, salt)
print(f"Hashed: {hashed}")

# Test verification
verify = bcrypt.checkpw(password_bytes, hashed)
print(f"Verified: {verify}")