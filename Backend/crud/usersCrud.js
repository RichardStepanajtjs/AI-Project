const bcrypt = require('bcryptjs');
const pool = require('../db/connection');

//USERS CRUD OPERATIONS

// Get all users
const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

// Get user by ID
const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, email, role, naam, achternaam, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Create new user
const createUser = async (email, password, role = 'user') => {
  const password_hash = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
    [email, password_hash, role]
  );
  
  return result.rows[0];
};

// Update user
const updateUser = async (id, { email, password, role, naam, achternaam }) => {
  // Check if user exists
  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
  if (userCheck.rows.length === 0) {
    throw new Error('User not found');
  }

  let updateQuery = 'UPDATE users SET ';
  let updateValues = [];
  let paramCount = 1;

  if (email !== undefined) {
    updateQuery += `email = $${paramCount}, `;
    updateValues.push(email);
    paramCount++;
  }

  if (password !== undefined) {
    const password_hash = await bcrypt.hash(password, 10);
    updateQuery += `password_hash = $${paramCount}, `;
    updateValues.push(password_hash);
    paramCount++;
  }

  if (role !== undefined) {
    updateQuery += `role = $${paramCount}, `;
    updateValues.push(role);
    paramCount++;
  }

  if (naam !== undefined) {
    updateQuery += `naam = $${paramCount}, `;
    updateValues.push(naam);
    paramCount++;
  }

  if (achternaam !== undefined) {
    updateQuery += `achternaam = $${paramCount}, `;
    updateValues.push(achternaam);
    paramCount++;
  }

  if (updateValues.length === 0) {
    throw new Error('No fields to update');
  }

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ` WHERE id = $${paramCount} RETURNING id, email, role, naam, achternaam, created_at`;
  updateValues.push(id);

  const result = await pool.query(updateQuery, updateValues);
  return result.rows[0];
};

// Delete user
const deleteUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, email',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
