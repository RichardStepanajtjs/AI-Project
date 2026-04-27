const pool = require('../db/connection');

// Get all models without model data
const getAllModels = async () => {
    const { rows } = await pool.query('SELECT id, version_label, description, is_active, f1_score FROM models ORDER BY created_at DESC');
    return rows;
};

// Get active model
const getActiveModel = async () => {
    const { rows } = await pool.query('SELECT * FROM models WHERE is_active = TRUE');
    return rows[0];
};

// Get model by ID
const getModelById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM models WHERE id = $1', [id]);
    return rows[0];
};

// Create a new model
const createModel = async (data) => {
    const { version_label, faiss_index, metadata_pkl, is_active, f1_score, description} = data;

    const faissBuffer = Buffer.from(faiss_index, 'base64');
    const metadataBuffer = Buffer.from(metadata_pkl, 'base64');

    const query = `
        INSERT INTO models (version_label, faiss_index, metadata_pkl, is_active, f1_score, description) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, version_label, is_active, created_at, description;
    `;
    
    const { rows } = await pool.query(query, [
        version_label,
        faissBuffer, 
        metadataBuffer,  
        is_active, 
        f1_score,
        description
    ]);
    
    return rows[0];
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
    if (data.is_active !== undefined) { 
        sets.push(`is_active = $${sets.length + 1}`); 
        values.push(data.is_active); 
    }
    if (data.f1_score !== undefined) { 
        sets.push(`f1_score = $${sets.length + 1}`); 
        values.push(data.f1_score); 
    }
    if (data.description !== undefined) { 
        sets.push(`description = $${sets.length + 1}`); 
        values.push(data.description); 
    }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE models SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Delete model
const deleteModel = async (id) => {
    const { rows } = await pool.query('DELETE FROM models WHERE id = $1 RETURNING id, version_label', [id]);
    return rows[0];
};

// Set model as active
const setModelActive = async (id) => {
    const query = `UPDATE models SET is_active = TRUE WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
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