/**
 * Database Query Utility
 * 
 * This script allows you to run queries against your database using Sequelize models.
 * 
 * Usage:
 * - Basic query: node db_query.js --model=User --action=find
 * - Count records: node db_query.js --model=Transaction --action=count
 * - Find one: node db_query.js --model=User --action=findOne --where='{"email":"example@example.com"}'
 */

const db = require('../models');
const { Op } = require('sequelize');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key.startsWith('--')) {
    params[key.substring(2)] = value;
  }
});

// Validate required parameters
if (!params.model) {
  console.error('Error: --model parameter is required');
  console.log('Example: node db_query.js --model=User --action=find');
  process.exit(1);
}

if (!params.action) {
  console.error('Error: --action parameter is required');
  console.log('Available actions: find, findOne, count, create, update, delete');
  console.log('Example: node db_query.js --model=User --action=find');
  process.exit(1);
}

// Get the model
const Model = db[params.model];
if (!Model) {
  console.error(`Error: Model '${params.model}' not found`);
  console.log('Available models:', Object.keys(db).filter(key => typeof db[key].findAll === 'function'));
  process.exit(1);
}

// Parse the where clause if provided
let where = {};
if (params.where) {
  try {
    where = JSON.parse(params.where);
  } catch (error) {
    console.error('Error parsing where clause:', error.message);
    console.log('Example: --where=\'{"email":"example@example.com"}\'');
    process.exit(1);
  }
}

// Parse the attributes if provided
let attributes = undefined;
if (params.attributes) {
  try {
    attributes = JSON.parse(params.attributes);
  } catch (error) {
    console.error('Error parsing attributes:', error.message);
    console.log('Example: --attributes=\'["id", "email"]\'');
    process.exit(1);
  }
}

// Parse the order if provided
let order = undefined;
if (params.order) {
  try {
    order = JSON.parse(params.order);
  } catch (error) {
    console.error('Error parsing order:', error.message);
    console.log('Example: --order=\'[["createdAt", "DESC"]]\'');
    process.exit(1);
  }
}

// Parse the limit if provided
let limit = undefined;
if (params.limit) {
  limit = parseInt(params.limit, 10);
  if (isNaN(limit)) {
    console.error('Error: limit must be a number');
    process.exit(1);
  }
}

// Parse the offset if provided
let offset = undefined;
if (params.offset) {
  offset = parseInt(params.offset, 10);
  if (isNaN(offset)) {
    console.error('Error: offset must be a number');
    process.exit(1);
  }
}

// Parse the include if provided
let include = undefined;
if (params.include) {
  try {
    // This is a simplified version, in reality include can be complex
    const includeModels = JSON.parse(params.include);
    include = includeModels.map(modelName => {
      if (typeof modelName === 'string') {
        return db[modelName];
      }
      return modelName;
    });
  } catch (error) {
    console.error('Error parsing include:', error.message);
    console.log('Example: --include=\'["Category"]\'');
    process.exit(1);
  }
}

// Build the query options
const queryOptions = {
  where,
  ...(attributes && { attributes }),
  ...(order && { order }),
  ...(limit && { limit }),
  ...(offset && { offset }),
  ...(include && { include }),
};

console.log(`Executing ${params.action} on ${params.model} with:`, queryOptions);

// Execute the query based on the action
async function executeQuery() {
  try {
    let result;
    
    switch (params.action) {
      case 'find':
        result = await Model.findAll(queryOptions);
        break;
      case 'findOne':
        result = await Model.findOne(queryOptions);
        break;
      case 'count':
        result = await Model.count(queryOptions);
        break;
      case 'create':
        if (!params.data) {
          console.error('Error: --data parameter is required for create action');
          console.log('Example: --data=\'{"name":"John","email":"john@example.com"}\'');
          process.exit(1);
        }
        const createData = JSON.parse(params.data);
        result = await Model.create(createData);
        break;
      case 'update':
        if (!params.data) {
          console.error('Error: --data parameter is required for update action');
          console.log('Example: --data=\'{"name":"Updated Name"}\'');
          process.exit(1);
        }
        const updateData = JSON.parse(params.data);
        result = await Model.update(updateData, { where });
        break;
      case 'delete':
        result = await Model.destroy({ where });
        break;
      default:
        console.error(`Error: Unknown action '${params.action}'`);
        process.exit(1);
    }
    
    console.log('Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Display count if result is an array
    if (Array.isArray(result)) {
      console.log(`\nTotal records: ${result.length}`);
    }
    
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    // Close the database connection
    await db.sequelize.close();
  }
}

executeQuery();
