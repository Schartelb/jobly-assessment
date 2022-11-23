"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job title for company already in database.
   * */

  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title, company_handle
           FROM jobs
           WHERE title = $1`,
      [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate listing: ${title}`);
console.log(company_handle)
    const result = await db.query(
      `INSERT INTO jobs
           (title,salary,equity,company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title,salary,equity,company_handle`,
      [
        title, salary, equity, company_handle
      ],
    );
    const job = result.rows[0];
    console.log(`job model `,job)
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT title,salary,equity,company_handle
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job title, return data about listing.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(
      `SELECT title,salary,equity, company_handle
           FROM jobs
           WHERE title = $1`,
      [title]);

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  //   static async getfiltered(query) {
  //     /** re-purposing sqlForPartialUpdate - changes to read query and populate     */
  //     const keys = Object.keys(query);
  //     /**checking if min greater than max  */
  //     if (query.minEmployees >= query.maxEmployees) 
  //       throw new ExpressError("Min cannot be greater than max", 400)
  //     ;
  //     /** check to see keys exist */
  //     if (keys.length === 0) throw new BadRequestError("No data");

  //     /**mapping keys to SQL expressions using booleans */
  //     const cols = keys.map((colName, idx) =>
  //       colName.includes("min") ? `num_employees>$${idx + 1}` : colName.includes("max") ? `num_employees<$${idx + 1}` :
  //         `handle=$${idx + 1}`)
  //     /**joins cols array to single SQL criteria string via .join with AND
  //       sets values as array of values for sql query*/
  //     let filterVars = {
  //       setCols: cols.join(" AND "),
  //       values: Object.values(query),
  //     }
  //     const jobsRes = await db.query(
  //       `SELECT handle,
  //               name,
  //               description,
  //               num_employees AS "numEmployees",
  //               logo_url AS "logoUrl"
  //        FROM jobs WHERE ${filterVars.setCols}
  //         ORDER BY name
  //        `, filterVars.values);
  //        /** if nothing returns throw error */
  //     if (jobsRes.rows.length === 0) {
  //       throw new ExpressError("No jobs match that criteria", 400)
  //     }
  //     return jobsRes.rows
  //   }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary equity, company_handle}
   *
   * Throws NotFoundError if not found.
   * 
   * Throws NotAuthorized error if user not Admin
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data, {});
    console.log(setCols,values)
    const jobIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE title = ${jobIdVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS companyHandle`;
    const result = await db.query(querySql, [...values, id]);
    const jobRes = result.rows[0];

    if (!jobRes) throw new NotFoundError(`No job: ${id}`);

    return jobRes;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {


    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]);
    const jobRes = result.rows[0];

    if (!jobRes) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
