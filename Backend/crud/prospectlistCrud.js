const pool = require('../db/connection');

const getAllProspectLists = async () => {
    const { rows } = await pool.query('SELECT * FROM prospect_lists ORDER BY created_at DESC');
    return rows;
};

const getProspectListsByUserId = async (userId) => {
    const { rows } = await pool.query('SELECT * FROM prospect_lists WHERE user_id = $1', [userId]);
    return rows;
};

const getProspectListById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM prospect_lists WHERE id = $1', [id]);
    return rows[0];
};


const createProspectList = async (data) => {
    const { user_id, naam, company_ids } = data;
    
    const query = `
        INSERT INTO prospect_lists (user_id, naam, company_ids) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
    
    const { rows } = await pool.query(query, [user_id, naam, company_ids]);
    return rows[0];
};

const updateProspectList = async (id, data) => {
    const sets = [];
    const values = [];

    if (data.naam) { sets.push(`naam = $${sets.length + 1}`); values.push(data.naam); }
    if (data.company_ids) { sets.push(`company_ids = $${sets.length + 1}`); values.push(data.company_ids); }
    if (data.user_id) { sets.push(`user_id = $${sets.length + 1}`); values.push(data.user_id); }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE prospect_lists SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteProspectList = async (id) => {
    const { rows } = await pool.query('DELETE FROM prospect_lists WHERE id = $1 RETURNING id, naam', [id]);
    return rows[0];
};

module.exports = {
    getAllProspectLists,
    getProspectListsByUserId,
    getProspectListById,
    createProspectList,
    updateProspectList,
    deleteProspectList
};