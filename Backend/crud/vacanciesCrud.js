const pool = require('../db/connection');

// VACANCIES CRUD OPERATIONS

// Get all vacancies
const getAllVacancies = async () => {
  const result = await pool.query(
    'SELECT * FROM vacancies ORDER BY created_at DESC'
  );
  return result.rows;
};

// Get vacancy by ID
const getVacancyById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM vacancies WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Create new vacancy
const createVacancy = async (data) => {
  const interneReferentie = data.vacatureReferentie?.interneReferentie;
  const vdabReferentie = data.vacatureReferentie?.vdabReferentie;
  const kboNummer = data.leverancier?.kboNummer;
  const leverancierNaam = data.leverancier?.naam;
  const leverancierType = data.leverancier?.type;
  const postcode = data.tewerkstellingsadres?.postcode;
  const gemeente = data.tewerkstellingsadres?.gemeente;
  const landCode = data.tewerkstellingsadres?.landCode;
  const beroepsprofielCode = data.functie?.beroepsprofiel?.code;
  const beroepsprofielLabel = data.functie?.beroepsprofiel?.label;
  const vereisten = data.profiel?.vereisten || [];
  const { text, embedding } = data;
  
  if (!interneReferentie) {
    throw new Error('interne_referentie (vacatureReferentie.interneReferentie) is required');
  }
  
  const result = await pool.query(
    `INSERT INTO vacancies 
      (interne_referentie, vdab_referentie, kbo_nummer, leverancier_naam, leverancier_type, 
       postcode, gemeente, land_code, beroepsprofiel_code, beroepsprofiel_label, vereisten, text, embedding) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
    [interneReferentie, vdabReferentie, kboNummer, leverancierNaam, leverancierType, 
     postcode, gemeente, landCode, beroepsprofielCode, beroepsprofielLabel, 
     JSON.stringify(vereisten), text, embedding]
  );
  
  return result.rows[0];
};

// Update vacancy
const updateVacancy = async (id, data) => {
  const vacancyCheck = await pool.query('SELECT id FROM vacancies WHERE id = $1', [id]);
  if (vacancyCheck.rows.length === 0) {
    throw new Error('Vacancy not found');
  }

  let updateQuery = 'UPDATE vacancies SET ';
  let updateValues = [];
  let paramCount = 1;

  const updateData = {};
  
  // Handle nested structure
  if (data.vacatureReferentie?.interneReferentie !== undefined) {
    updateData.interne_referentie = data.vacatureReferentie.interneReferentie;
  }
  if (data.vacatureReferentie?.vdabReferentie !== undefined) {
    updateData.vdab_referentie = data.vacatureReferentie.vdabReferentie;
  }
  if (data.leverancier?.kboNummer !== undefined) {
    updateData.kbo_nummer = data.leverancier.kboNummer;
  }
  if (data.leverancier?.naam !== undefined) {
    updateData.leverancier_naam = data.leverancier.naam;
  }
  if (data.leverancier?.type !== undefined) {
    updateData.leverancier_type = data.leverancier.type;
  }
  if (data.tewerkstellingsadres?.postcode !== undefined) {
    updateData.postcode = data.tewerkstellingsadres.postcode;
  }
  if (data.tewerkstellingsadres?.gemeente !== undefined) {
    updateData.gemeente = data.tewerkstellingsadres.gemeente;
  }
  if (data.tewerkstellingsadres?.landCode !== undefined) {
    updateData.land_code = data.tewerkstellingsadres.landCode;
  }
  if (data.functie?.beroepsprofiel?.code !== undefined) {
    updateData.beroepsprofiel_code = data.functie.beroepsprofiel.code;
  }
  if (data.functie?.beroepsprofiel?.label !== undefined) {
    updateData.beroepsprofiel_label = data.functie.beroepsprofiel.label;
  }
  if (data.profiel?.vereisten !== undefined) {
    updateData.vereisten = JSON.stringify(data.profiel.vereisten);
  }
  if (data.text !== undefined) {
    updateData.text = data.text;
  }
  if (data.embedding !== undefined) {
    updateData.embedding = data.embedding;
  }

  const allowedFields = ['interne_referentie', 'vdab_referentie', 'kbo_nummer', 'leverancier_naam', 
                         'leverancier_type', 'postcode', 'gemeente', 'land_code', 
                         'beroepsprofiel_code', 'beroepsprofiel_label', 'vereisten', 'text', 'embedding'];
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined && updateData[field] === undefined) {
      updateData[field] = data[field];
    }
  });

  // Build the query
  Object.entries(updateData).forEach(([field, value]) => {
    updateQuery += `${field} = $${paramCount}, `;
    updateValues.push(value);
    paramCount++;
  });

  if (updateValues.length === 0) {
    throw new Error('No fields to update');
  }

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
  updateValues.push(id);

  const result = await pool.query(updateQuery, updateValues);
  return result.rows[0];
};

// Delete vacancy
const deleteVacancy = async (id) => {
  const result = await pool.query(
    'DELETE FROM vacancies WHERE id = $1 RETURNING id, interne_referentie, leverancier_naam',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Vacancy not found');
  }
  
  return result.rows[0];
};

module.exports = {
  getAllVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  deleteVacancy
};
