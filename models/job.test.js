"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll } = require("./job.js");
const Job = require("./job.js");
const jobs = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "title",
        salary: 10,
        equity: "0.5",
        company_handle: "c1"
    }

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob)

        const result = await db.query(`SELECT title, salary, equity, company_handle 
            FROM jobs
            WHERE title='title'`);

        expect(result.rows).toEqual([{
            title: "title",
            salary: 10,
            equity: "0.5",
            company_handle: "c1"

        }])
    })
    test("failure with duplicate", async function () {
        try {
            await Job.create(newJob);
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy()
        }
    })
})

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: 'title1',
                salary: 10,
                equity: '0.1',
                company_handle: 'c1'
            },
            {
                title: 'title2',
                salary: 20,
                equity: '0.2',
                company_handle: 'c2'
            },
            {
                title: 'title3',
                salary: 30,
                equity: '0.3',
                company_handle: 'c3'
            }
            ,
        ]);
    });

    /************************************** get */

describe("get", function () {
    test("works", async function () {
      let job = await Job.get("title1");
      expect(job).toEqual({
                title: 'title1',
                salary: 10,
                equity: '0.1',
                company_handle: 'c1'
            });
    });
  
    test("not found if no such Job", async function () {
      try {
        await Job.get("nope");
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
});