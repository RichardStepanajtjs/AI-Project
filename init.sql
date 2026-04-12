/* User tabel (GH-...) */
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, role) 
VALUES
    ('admin@sokrates.be', '$2a$10$sVTZ9XC/0Net2Q/fzHpYbuJCO352bA0Wi7q5EHzqdStx.LbRGEMvS', 'admin'),
    ('user@sokrates.be', '$2a$10$sVTZ9XC/0Net2Q/fzHpYbuJCO352bA0Wi7q5EHzqdStx.LbRGEMvS', 'user')
ON CONFLICT (email) DO NOTHING;

/* Vacancy tabel (GH-...) */
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Company tabel (GH-43) */
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    naam VARCHAR(255) NOT NULL,
    kbonummer VARCHAR(20) UNIQUE NOT NULL,
    postcode VARCHAR(20),
    gemeente VARCHAR(100),
    landcode VARCHAR(10),
    email VARCHAR(255),
    telefoonnummer VARCHAR(50),
    jobdomein VARCHAR(100),
    technologies VARCHAR(50)[],
    text TEXT,
    embedding FLOAT4[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO companies (naam, kbonummer, postcode, gemeente, landcode, email, telefoonnummer, jobdomein, text) -- GEEN ID want serial
VALUES
('Rich-Hard Capital', '1', '2000', 'Antwerpen', 'BE', 'contact@rich-hardcapital.be', '+3231234567', 'ICT', 'Rich-Hard Capital is een toonaangevende durfkapitaalverstrekker die zich richt op de tech-sector in Antwerpen. We bieden strategische ondersteuning en financiering voor innovatieve startups met een sterke groeiambitie. Ons team van experts helpt ondernemers om hun technologische visie om te zetten in marktconforme oplossingen.'),
('Souf-souf Soufflés', '2', '1000', 'Brussel', 'BE', 'souf@soufiwoufi.be', '+3267676767', 'Horeca en toerisme', 'Souf-souf Soufflés brengt de authentieke Franse patisserie naar het hartje van onze hoofdstad Brussel. Wij specialiseren ons in het bereiden van vederlichte soufflés met zowel klassieke als moderne smaakcombinaties. Elke creatie wordt met de hand gemaakt door onze meester-banketbakkers voor een unieke gastronomische ervaring.'),
('Sharp Angles INC', '3', '3000', 'Gent', 'BE', 'hallo@bye.be', '+32042069', 'Andere', 'Sharp Angles INC is een multidisciplinair ontwerpbureau gevestigd in de creatieve hub van Gent. Wij combineren scherpe esthetiek met functioneel design voor uiteenlopende projecten in de publieke ruimte. Onze aanpak kenmerkt zich door een onconventionele kijk op architectuur en visuele communicatie.')
ON CONFLICT (kbonummer) DO NOTHING;


/* Prospectlist tabel (GH-46) */
CREATE TABLE IF NOT EXISTS prospect_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    naam VARCHAR(255) NOT NULL,
    jobdomein VARCHAR(100),
    company_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO prospect_lists (user_id, naam, jobdomein, company_ids)
VALUES
(1, 'Prospect 1', 'ICT', ARRAY[1]),
(1, 'Prospect 2', 'Horeca en toerisme', ARRAY[2]),
(1, 'Prospect 3', 'Andere', ARRAY[3])
;

CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    version_label VARCHAR(255) NOT NULL,
    faiss_index BYTEA NOT NULL,          
    metadata_pkl BYTEA NOT NULL,         
    is_active BOOLEAN DEFAULT FALSE,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT                     
);
/* Model Tabel (GH-...) */
CREATE INDEX idx_active_model ON models (is_active) WHERE is_active = TRUE;
CREATE OR REPLACE FUNCTION set_single_active_model()
    RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.is_active = TRUE THEN
            UPDATE models
            SET is_active = FALSE
            WHERE is_active = TRUE AND id IS DISTINCT FROM NEW.id;
        END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_active_model
BEFORE INSERT OR UPDATE ON models
FOR EACH ROW
EXECUTE FUNCTION set_single_active_model();

/* Form Tabel (GH-52) */
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    partner_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    technologies VARCHAR(50)[],
    description TEXT,
    embedding FLOAT4[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO forms (partner_name, sector, technologies, description)
VALUES(
    'VDAB Innovatielab',
    'IT en Technologie',
    ARRAY['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
    'Een exclusief samenwerkingsforum gericht op de integratie van nieuwe webtechnologieën en AI binnen het Vlaamse werklandschap.'
);