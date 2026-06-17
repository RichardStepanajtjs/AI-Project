/* User table (GH-...) */
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'sales',
    naam VARCHAR(255),
    achternaam VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);

INSERT INTO users (email, password_hash, role, naam, achternaam)
VALUES
    ('admin@sokrates.be', '$2a$10$sVTZ9XC/0Net2Q/fzHpYbuJCO352bA0Wi7q5EHzqdStx.LbRGEMvS', 'admin', 'Admin', 'Sokrates'),
    ('user@sokrates.be', '$2a$10$sVTZ9XC/0Net2Q/fzHpYbuJCO352bA0Wi7q5EHzqdStx.LbRGEMvS', 'user', 'John', 'Doe')
ON CONFLICT (email) DO NOTHING;

/* Vacancy table (GH-...) */
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
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);

/* Company table (GH-43) */
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
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);

/* KBO table */
CREATE TABLE IF NOT EXISTS kbo_companies (
    id SERIAL PRIMARY KEY,
    enterprise_number VARCHAR(20) UNIQUE NOT NULL,
    naam VARCHAR(255),
    juridical_form VARCHAR(20),
    start_date VARCHAR(20),
    postcode VARCHAR(10),
    gemeente VARCHAR(100),
    straat VARCHAR(255),
    huisnummer VARCHAR(20),
    email VARCHAR(255),
    telefoonnummer VARCHAR(50),
    nace_activiteiten TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Form table (GH-52) */
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    technologies VARCHAR(50)[],
    is_job BOOLEAN DEFAULT FALSE,
    description TEXT,
    generated_description TEXT,
    embedding FLOAT4[],
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);

/* Prospectlist table (GH-46) */
CREATE TABLE IF NOT EXISTS prospect_lists (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    form_id INT REFERENCES forms(id) ON DELETE CASCADE,
    naam VARCHAR(255) NOT NULL,
    jobdomein VARCHAR(100),
    company_ids INTEGER[] NOT NULL,
    accuracy_scores FLOAT4[],
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);

/* Model table (GH-) */
CREATE TABLE IF NOT EXISTS models (
    id SERIAL PRIMARY KEY,
    version_label VARCHAR(255) NOT NULL,
    faiss_index BYTEA NOT NULL,
    metadata_pkl BYTEA NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels'),
    f1_score FLOAT4 DEFAULT 0.0,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_active_model ON models (is_active) WHERE is_active = TRUE;

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

CREATE OR REPLACE TRIGGER trg_single_active_model
BEFORE INSERT OR UPDATE ON models
FOR EACH ROW
EXECUTE FUNCTION set_single_active_model();

/* Test Data table (GH-63) */
CREATE TABLE IF NOT EXISTS test_data (
    id SERIAL PRIMARY KEY,
    prospect_list_id INT REFERENCES prospect_lists(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Europe/Brussels')
);
