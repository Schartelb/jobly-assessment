const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/** Changes JSON to SQL query via map & join operation */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //makes keys iterable object from JSON data
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
/**returning JSON object with SQL query pre-built and values in values key */
  return { 
    //joins cols array into single string via .join with commas
    setCols: cols.join(", "),
    //
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
