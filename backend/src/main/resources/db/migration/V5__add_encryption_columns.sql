ALTER TABLE passwords CHANGE password encrypted_password TEXT NOT NULL;

ALTER TABLE passwords ADD COLUMN encryption_iv VARCHAR(255) NOT NULL;