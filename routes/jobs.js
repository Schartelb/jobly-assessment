"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { checkAdminorActiveUser } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const db = require("../db");

const router = new express.Router();


router.get("/", async function (req, res, next) {
    try {
      /** check if req.query used */
      if(Object.values(req.query)!=0){
        /** if used, return filtered job/jobs */
        const filtered= await Job.getfiltered(req.query)
        return res.json(filtered)
      }else{const jobs = await Job.findAll();
      return res.json({ jobs })};
    } catch (err) {
      return next(err);
    }
  });

/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */
router.post("/",checkAdminorActiveUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        console.log(req.body)
        const job = await Job.create(req.body);
        console.log(`post route `, job)
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[handle]
 *   *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { title, salary, equity}
 *
 * Authorization required: Admin
 */

router.patch("/:title", checkAdminorActiveUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.title, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

router.delete("/:id",checkAdminorActiveUser, async function (req, res, next) {
    try {
        await Job.remove(req.params.id)
        return res.json({deleted: `Job #${req.params.id} has been deleted`})
    } catch (err) {
        return next(err)
    }
})



module.exports = router     