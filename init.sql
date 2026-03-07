CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*INSERT INTO users (email, password_hash, role) 
VALUES ('admin@sokrates.be', '$2b$10$n7E.1v.vG.7E.1v.vG.7E.1v.vG.7E.1v.vG.7E.1v.vG', 'admin')
ON CONFLICT (email) DO NOTHING;
*/

CREATE TABLE IF NOT EXISTS vacancies (
    id SERIAL PRIMARY KEY,
    interne_referentie UUID UNIQUE NOT NULL,
    vdab_referentie BIGINT,
    kbo_nummer VARCHAR(20),
    leverancier_naam VARCHAR(255),
    leverancier_type VARCHAR(100),
    postcode SMALLINT,
    gemeente VARCHAR(50),
    land_code VARCHAR(5),
    beroepsprofiel_code VARCHAR(50),
    beroepsprofiel_label VARCHAR(255),
    vereisten JSONB,
    text TEXT,
    embedding FLOAT4[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);