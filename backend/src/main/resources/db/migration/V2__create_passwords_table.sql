CREATE TABLE passwords (
                           id BINARY(16) NOT NULL,
                           user_id BINARY(16) NOT NULL,
                           password VARCHAR(255),
                           website_url VARCHAR(255),
                           category VARCHAR(50),
                           strength VARCHAR(50),
                           notes TEXT,
                           PRIMARY KEY (id),
                           CONSTRAINT fk_user
                               FOREIGN KEY (user_id)
                                   REFERENCES users(id)
                                   ON DELETE CASCADE
) ENGINE=InnoDB;