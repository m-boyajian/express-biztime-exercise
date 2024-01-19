const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const slugify = require('slugify');

let router = new express.Router();

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT code, name FROM companies`
    );

    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
      [code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    const company = results.rows[0];
    const invoicesResults = await db.query(
      `SELECT id FROM invoices WHERE comp_code = $1`,
      [code]
    );
    company.invoices = invoicesResults.rows.map((row) => row.id);
    return res.json({ "company": company });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true }); // Generate code using slugify
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
      const { code } = req.params;
      const { name, description } = req.body;
      const results = await db.query(
          `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
          [name, description, code]
      );

      if (results.rows.length === 0) {
          throw new ExpressError(`Company not found: ${code}`, 404);
      }

      return res.json({ company: result.rows[0] });
  } catch (err) {
      return next(err);
  }
});

router.delete("/:code", async (req,res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `DELETE FROM companies WHERE code = $1 RETURNING code`,
      [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Company not found: ${code}`, 404);
    }
  } catch (err) {
    return next (err);
  }
});

module.exports = router;
