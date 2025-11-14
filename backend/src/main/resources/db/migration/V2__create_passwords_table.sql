CREATE TABLE passwords (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    password VARCHAR(255),
    website_url VARCHAR(255),
    category ENUM('WORK', 'PERSONAL', 'SOCIAL', 'BANKING', 'OTHER'),
    strength ENUM('VERYWEAK', 'WEAK', 'FAIR', 'STRONG','VERYSTRONG'),
    notes TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);