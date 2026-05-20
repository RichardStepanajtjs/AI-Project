const pool = require('../db/connection');

const getAllKboCompanies = async () => {
    const { rows } = await pool.query('SELECT * FROM kbo_companies ORDER BY created_at DESC');
    return rows;
};

const getKboCompanyByEnterpriseNumber = async (enterpriseNumber) => {
    // Normaliseer beide kanten. Verwijderd punten voor vergelijking.
    // VDAB heeft "0732580523", KBO slaat het op als "0732.580.523"
    const normalized = enterpriseNumber.replace(/\./g, '');
    const { rows } = await pool.query(
        "SELECT * FROM kbo_companies WHERE REPLACE(enterprise_number, '.', '') = $1",
        [normalized]
    );
    return rows[0];
};

const createKboCompany = async (data) => {
    const {
        enterprise_number, naam, juridical_form, start_date,
        postcode, gemeente, straat, huisnummer,
        email, telefoonnummer, nace_main, nace_omschrijving
    } = data;

    const query = `
        INSERT INTO kbo_companies
            (enterprise_number, naam, juridical_form, start_date, postcode, gemeente, straat, huisnummer, email, telefoonnummer, nace_main, nace_omschrijving)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
    `;

    const { rows } = await pool.query(query, [
        enterprise_number, naam, juridical_form, start_date,
        postcode, gemeente, straat, huisnummer,
        email, telefoonnummer, nace_main, nace_omschrijving
    ]);
    return rows[0];
};

const bulkCreateKboCompanies = async (companies) => {
    if (!companies || companies.length === 0) return { inserted: 0, skipped: 0 };

    const fields = [
        'enterprise_number', 'naam', 'juridical_form', 'start_date',
        'postcode', 'gemeente', 'straat', 'huisnummer',
        'email', 'telefoonnummer', 'nace_main', 'nace_omschrijving'
    ];
    const numFields = fields.length;

    const valuePlaceholders = companies.map((_, i) =>
        `(${Array.from({ length: numFields }, (_, j) => `$${i * numFields + j + 1}`).join(', ')})`
    ).join(', ');

    const params = companies.flatMap(c => fields.map(f => c[f] || null));

    const query = `
        INSERT INTO kbo_companies (${fields.join(', ')})
        VALUES ${valuePlaceholders}
        ON CONFLICT (enterprise_number) DO NOTHING
    `;

    const result = await pool.query(query, params);
    return { inserted: result.rowCount, skipped: companies.length - result.rowCount };
};

const getKboCompaniesCount = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM kbo_companies');
    return rows[0].count;
};

module.exports = {
    getAllKboCompanies,
    getKboCompanyByEnterpriseNumber,
    createKboCompany,
    bulkCreateKboCompanies,
    getKboCompaniesCount,
};
