CREATE TABLE vault_metadata (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    kdf_salt VARCHAR(255) NOT NULL,
    auth_hash VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user_id),
    CONSTRAINT fk_vault_metadata_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;