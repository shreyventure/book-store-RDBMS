const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  ensureAuthenticatedDEV,
  forwardAuthenticatedDEV,
} = require("../config/auth");

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
    console.log("MySQL database connected for products.");
  }
});
// -----------------------------

//route   GET (/products/login)
// desc   log developers in
router.get("/login", forwardAuthenticatedDEV, (req, res) => {
  res.render("devLogin", {});
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: `/products/dev/dashboard`,
    failureRedirect: "/products/login",
    failureFlash: true,
  })(req, res, next);
});

// route GET (/products/dev/dashboard)
// desc developer's dashboard
router.get("/dev/dashboard", ensureAuthenticatedDEV, (req, res) => {
  DB.query("SELECT * FROM products", (err, results) => {
    if (err) throw err;
    res.render("devDashboard", {
      name: req.user.username,
      products: results,
    });
  });
});

// route  GET (/products)
// desc   fetch products from database
router.get("/", (req, res) => {
  DB.query("SELECT * FROM products", (err, results) => {
    if (err) throw err;
    //console.log(beautify(results, null, 2, 100));
    res.json(results);
  });
});

// route  GET (/products/add)
// desc   add product to database
router.get("/add", ensureAuthenticatedDEV, (req, res) => {
  res.render("addProduct", {
    add: false,
  });
});
router.post("/add", ensureAuthenticatedDEV, (req, res) => {
  const { name, availability, cost, image, description } = req.body;
  var Query = `INSERT INTO products (name, availability, cost, image, description) VALUES ("${name}",${availability},${cost},"${image}","${description}")`;
  DB.query(Query, (error, results) => {
    if (error) throw error;
    if (results.affectedRows !== 0) {
      res.render("addProduct", {
        add: true,
      });
    }
  });
});

// route  GET (/products/update)
// desc   search and update products in database
router.get("/search", ensureAuthenticatedDEV, (req, res) => {
  res.render("updateProduct", {
    up: false,
    no: 0,
    product: false,
    updated: false,
  });
});
router.post("/search", (req, res) => {
  const { name } = req.body;
  const Q = `SELECT * FROM products WHERE name = "${name}"`;
  DB.query(Q, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.render("updateProduct", {
        up: true,
        no: 0,
        product: null,
        updated: false,
      });
    } else {
      res.render("updateProduct", {
        up: true,
        no: 1,
        product: results[0],
        updated: false,
      });
    }
  });
});
router.post("/search/:id", (req, res) => {
  const id = req.params.id;
  const { name, availability, cost, image, description } = req.body;
  const Q = `UPDATE products SET name = "${name}", availability = ${availability}, cost = ${cost}, image = "${image}", description = "${description}" WHERE id = ${id}`;

  DB.query(Q, (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.render("updateProduct", {
        up: false,
        no: 0,
        product: false,
        updated: true,
      });
    }
  });
});
router.get("/update/:id", (req, res) => {
  const id = req.params.id;
  const Q = `SELECT * FROM products WHERE id = "${id}"`;
  DB.query(Q, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.render("updateProduct", {
        up: true,
        no: 0,
        product: null,
        updated: false,
      });
    } else {
      res.render("update", {
        product: results[0],
      });
    }
  });
});

// route  GET (/products/delete)
// desc   delete products from database
router.get("/delete", ensureAuthenticatedDEV, (req, res) => {
  res.render("deleteProduct", {
    del: false,
  });
});
router.get("/delete/:id", ensureAuthenticatedDEV, (req, res) => {
  const id = req.params.id;
  let sql = `DELETE FROM products WHERE id = ${id}`;
  DB.query(sql, function (err, result) {
    if (err) throw err;
    res.redirect("/dev/dashboard");
  });
});
router.post("/delete", ensureAuthenticatedDEV, (req, res) => {
  const name = req.body.name;
  let sql = `DELETE FROM products WHERE name = '${name}'`;

  DB.query(sql, function (err, result) {
    if (err) throw err;
    res.render("deleteProduct", {
      del: true,
      no: result.affectedRows,
    });
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Logged out successfully!");
  res.redirect("/products/login");
});

module.exports = router;
