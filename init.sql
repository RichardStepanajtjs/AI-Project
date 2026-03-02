CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, role) 
VALUES ('admin@sokrates.be', '$2b$10$n7E.1v.vG.7E.1v.vG.7E.1v.vG.7E.1v.vG.7E.1v.vG', 'admin')
ON CONFLICT (email) DO NOTHING;