const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

let router = new express.Router();

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT id, comp_code FROM invoices`
    );

    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});
  
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id, 
              i.comp_code, 
              i.amt, 
              i.paid, 
              i.add_date, 
              i.paid_date, 
              c.name, 
              c.description 
       FROM invoices AS i
         INNER JOIN companies AS c ON (i.comp_code = c.code)  
       WHERE i.id = $1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }

    const data = results.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };
    return res.json({ "invoice": invoice });
  } catch (err) {
    return next(err);
  }
});
  
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (err) {
      return next(err);
  }
});
  
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    let paidDate = null;
    if (paid === true) {
      paidDate = new Date(); // Set paid_date to today if paying unpaid invoice
    }

    const results = await db.query(
      "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, paid, paidDate, id]
    );

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});
  
router.delete("/:id", async (req,res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id",
      [id]
    );

    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found"});
    }
    return res.json({ status: "deleted"});
  } catch (err) {
    return next (err);
  }
});
  
module.exports = router;


