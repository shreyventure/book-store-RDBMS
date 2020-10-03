const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ensureAuthenticatedDEV } = require("../config/auth");

//Create Mysql connections -----

const {
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = require("../config/keys");

const mysql = require("mysql");
const DB = mysql.createConnection({
  host: "localhost",
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
});

DB.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQL database connected for transactions.");
  }
});
// -----------------------------

router.get("/search", ensureAuthenticatedDEV, async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:8000/transactions/query"
    );
    res.render("transactions");
  } catch (error) {
    console.error(error);
  }
});
router.get("/query", ensureAuthenticatedDEV, (req, res) => {
  const str = req.query.str;
  if (str) {
    var Q = `SELECT * from transactions WHERE (INSTR(custid, "${str}") != 0 or INSTR(sessid, "${str}") != 0 or INSTR(userEmail, "${str}") != 0) and delivered IS FALSE;`;
  } else {
    var Q = "SELECT * FROM transactions WHERE delivered IS FALSE";
  }
  DB.query(Q, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
router.get("/update/:id", ensureAuthenticatedDEV, (req, res) => {
  const id = req.params.id;
  const Q = `UPDATE transactions SET delivered = TRUE, delivery_date = CURRENT_TIMESTAMP WHERE id = ${id}`;
  DB.query(Q, (err, result) => {
    if (err) throw err;
    if (result) {
      req.flash("success_msg", `Transaction ${id} marked as delivered!`);
      res.redirect("/transactions/search");
    }
  });
});
module.exports = router;
