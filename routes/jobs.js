"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/company");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();
/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        console.log(req.body)
        const job = await Job.create(req.body);
        console.log(`post route `,job)
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});


module.exports = router