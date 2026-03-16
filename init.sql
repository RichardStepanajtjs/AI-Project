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

/* Bedrijven tabel (GH-43) */
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    naam VARCHAR(255) NOT NULL,
    kbonummer VARCHAR(20) UNIQUE NOT NULL,
    postcode VARCHAR(20),
    gemeente VARCHAR(100),
    landcode VARCHAR(10),
    email VARCHAR(255),
    telefoonnummer VARCHAR(50),
    jobdomein VARCHAR(100)
);

/* Dummy data voor Bedrijven (GH-43) */
INSERT INTO companies (naam, kbonummer, postcode, gemeente, landcode, email, telefoonnummer, jobdomein) -- GEEN ID want serial
VALUES 
('Rich-Hard Capital', '1', '2000', 'Antwerpen', 'BE', 'contact@rich-hardcapital.be', '+3231234567', 'ICT'),
('Souf-souf Soufflés', '2', '1000', 'Brussel', 'BE', 'souf@soufiwoufi.be', '+3267676767', 'Horeca en toerisme'),
('Sharp Angles INC', '3', '3000', 'Gent', 'BE', 'hallo@bye.be', '+32042069', 'Andere')
ON CONFLICT (kbonummer) DO NOTHING;