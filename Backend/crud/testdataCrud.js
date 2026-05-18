const pool = require('../db/connection');

// TEST DATA CURD OPERATIONS

// Get all test data
const getAllTestData = async () => {
    const { rows } = await pool.query('SELECT * FROM test_data ORDER BY created_at DESC');
    return rows;
};

// Get test data by ID
const getTestDataById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM test_data WHERE id = $1', [id]);
    return rows;
};

// Create new test data
const createTestData = async (prospect_list_id) => {
    const query = `
        INSERT INTO test_data (prospect_list_id) 
        VALUES ($1) 
        RETURNING *`;
            
    const { rows } = await pool.query(query, [prospect_list_id]);
    return rows[0];
};

// Update test data
const updateTestData = async (id,prospect_list_id) => {
    const sets = [];
    const values = [];

    if (prospect_list_id) { sets.push(`prospect_list_id = $${sets.length + 1}`); values.push(prospect_list_id); }

    if (sets.length === 0) return null;

    values.push(id);
    const query = `UPDATE test_data SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING prospect_list_id, created_at`;
    
    const { rows } = await pool.query(query, values);
    return rows[0];
}


// Delete test data
const deleteTestData = async (id) => {
    const result = await pool.query(
        'DELETE FROM test_data WHERE id == $1 RETURNING prospect_list_id, created_at',
        [id]
    );
    if (result.rowCount === 0) {
        throw new Error('Test data not found');
    }
    return result.rows[0];
};

models.exports = {
    getAllTestData,
    getTestDataById,
    createTestData,
    updateTestData,
    deleteTestData
};