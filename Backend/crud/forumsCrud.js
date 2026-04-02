const pool = require('../db/connection');

// Get all forums
const getAllForums = async () => {
    const { rows } = await pool.query('SELECT * FROM forums ORDER BY created_at DESC');
    return rows;
};

// Get forum by ID
const getForumById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM forums WHERE id = $1', [id]);
    return rows[0];
};

// Create a new forum
const createForum = async (data) => {
    const { partner_name, sector, description, technologies } = data;

    const query = `
        INSERT INTO forums (partner_name, sector, description, technologies) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
        partner_name, 
        sector, 
        description, 
        technologies || []
    ]);
    
    return rows[0];
};

// Update forum
const updateForum = async (id, data) => {
    const sets = [];
    const values = [];

    if (data.partner_name !== undefined) { 
        sets.push(`partner_name = $${sets.length + 1}`); 
        values.push(data.partner_name); 
    }
    if (data.sector !== undefined) { 
        sets.push(`sector = $${sets.length + 1}`); 
        values.push(data.sector); 
    }
    if (data.description !== undefined) { 
        sets.push(`description = $${sets.length + 1}`); 
        values.push(data.description); 
    }
    if (data.technologies !== undefined) { 
        sets.push(`technologies = $${sets.length + 1}`); 
        values.push(data.technologies); 
    }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE forums SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Delete forum
const deleteForum = async (id) => {
    const { rows } = await pool.query('DELETE FROM forums WHERE id = $1 RETURNING id, partner_name', [id]);
    return rows[0];
};

module.exports = {
    getAllForums,
    getForumById,
    createForum,
    updateForum,
    deleteForum
};