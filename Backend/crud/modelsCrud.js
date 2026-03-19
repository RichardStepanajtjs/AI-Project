const pool = require('../db/connection');

// Get all models
const getAllModels = async () => {
    const { rows } = await pool.query('SELECT * FROM models ORDER BY created_at DESC');
    return rows;
};

// Get all active models
const getActiveModel = async () => {
    const { result } = await pool.query('SELECT * FROM models WHERE is_active = TRUE');
    return result.rows[0];
};

// Get model by ID
const getModelById = async (id) => {
    const { result } = await pool.query('SELECT * FROM models WHERE id = $1', [id]);
    return result.rows[0];
};

// Create a new model
const createModel = async (data) => {
    const { version_label, faiss_index, metadata_pkl, description, is_active = false } = data;
    
    const query = `
        INSERT INTO models (version_label, faiss_index, metadata_pkl, description, is_active) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
    
    const { result } = await pool.query(query, [
        version_label, 
        faiss_index, 
        metadata_pkl, 
        description, 
        is_active
    ]);
    return result.rows[0];
};

// Update model
const updateModel = async (id, data) => {
    const sets = [];
    const values = [];

    if (data.version_label) { 
        sets.push(`version_label = $${sets.length + 1}`); 
        values.push(data.version_label); 
    }
    if (data.faiss_index) { 
        sets.push(`faiss_index = $${sets.length + 1}`); 
        values.push(data.faiss_index); 
    }
    if (data.metadata_pkl) { 
        sets.push(`metadata_pkl = $${sets.length + 1}`); 
        values.push(data.metadata_pkl); 
    }
    if (data.description !== undefined) { 
        sets.push(`description = $${sets.length + 1}`); 
        values.push(data.description); 
    }
    if (data.is_active !== undefined) { 
        sets.push(`is_active = $${sets.length + 1}`); 
        values.push(data.is_active); 
    }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE models SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { result } = await pool.query(query, values);
    return result.rows[0];
};

// Delete model
const deleteModel = async (id) => {
    const { result } = await pool.query('DELETE FROM models WHERE id = $1 RETURNING id, version_label', [id]);
    return result.rows[0];
};

// Set model as active
const setModelActive = async (id) => {
    const query = `UPDATE models SET is_active = TRUE WHERE id = $1 RETURNING *`;
    const { result } = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAllModels,
    getActiveModel,
    getModelById,
    createModel,
    updateModel,
    deleteModel,
    setModelActive
};
