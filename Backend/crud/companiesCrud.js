const pool = require('../db/connection');

const getAllCompaniesWithEmbeddings = async () => {
    const { rows } = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    return rows;
};

const getAllCompaniesWithoutEmbeddings = async () => {
    const { rows } = await pool.query('SELECT id, naam, kbonummer, postcode, gemeente, landcode, email, telefoonnummer, jobdomein, text, technologies, created_at FROM companies ORDER BY created_at DESC');
    return rows;
}

const getCompanyById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return rows[0];
};

const getCompaniesByDomain = async (domain) => {
    const query = 'SELECT * FROM companies WHERE jobdomein = $1 ORDER BY naam ASC';
    const { rows } = await pool.query(query, [domain]);
    return rows;
};

const createCompany = async (data) => {
    const { 
        naam, kbonummer, postcode, gemeente, landcode, 
        email, telefoonnummer, jobdomein, text, embedding 
    } = data;
    
    const query = `
        INSERT INTO companies (naam, kbonummer, postcode, gemeente, landcode, email, telefoonnummer, jobdomein, text, embedding) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`;
    
    const { rows } = await pool.query(query, [
        naam, kbonummer, postcode, gemeente, landcode, 
        email, telefoonnummer, jobdomein, text, embedding
    ]);
    return rows[0];
};

const updateCompany = async (id, data) => {
    const sets = [];
    const values = [];

    if (data.naam) { sets.push(`naam = $${sets.length + 1}`); values.push(data.naam); }
    if (data.kbonummer) { sets.push(`kbonummer = $${sets.length + 1}`); values.push(data.kbonummer); }
    if (data.postcode) { sets.push(`postcode = $${sets.length + 1}`); values.push(data.postcode); }
    if (data.gemeente) { sets.push(`gemeente = $${sets.length + 1}`); values.push(data.gemeente); }
    if (data.landcode) { sets.push(`landcode = $${sets.length + 1}`); values.push(data.landcode); }
    if (data.email) { sets.push(`email = $${sets.length + 1}`); values.push(data.email); }
    if (data.telefoonnummer) { sets.push(`telefoonnummer = $${sets.length + 1}`); values.push(data.telefoonnummer); }
    if (data.jobdomein) { sets.push(`jobdomein = $${sets.length + 1}`); values.push(data.jobdomein); }
    if (data.text) { sets.push(`text = $${sets.length + 1}`); values.push(data.text); }
    if (data.embedding) { sets.push(`embedding = $${sets.length + 1}`); values.push(data.embedding); }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE companies SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteCompany = async (id) => {
    const { rows } = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING id, naam', [id]);
    return rows[0];
};

module.exports = {
    getAllCompaniesWithEmbeddings,
    getAllCompaniesWithoutEmbeddings,
    getCompanyById,
    getCompaniesByDomain,
    createCompany,
    updateCompany,
    deleteCompany
};