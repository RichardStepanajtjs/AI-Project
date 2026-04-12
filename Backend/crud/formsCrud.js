const pool = require('../db/connection');

// Get all forms
const getAllForms = async () => {
    const { rows } = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
    return rows;
};

// Get form by ID
const getFormById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM forms WHERE id = $1', [id]);
    return rows[0];
};

// Create a new form
const createForm = async (data) => {
    const { partner_name, sector, description, technologies, embedding } = data;

    const query = `
        INSERT INTO forms (partner_name, sector, description, technologies, embedding) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
        partner_name, 
        sector, 
        description, 
        technologies, embedding
    ]);
    
    return rows[0];
};

// Update form
const updateForm = async (id, data) => {
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

    if (data.embedding !== undefined) { 
        sets.push(`embedding = $${sets.length + 1}`); 
        values.push(data.embedding); 
    }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE forms SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Delete form
const deleteForm = async (id) => {
    const { rows } = await pool.query('DELETE FROM forms WHERE id = $1 RETURNING id, partner_name', [id]);
    return rows[0];
};

module.exports = {
    getAllForms,
    getFormById,
    createForm,
    updateForm,
    deleteForm
};