const express = require("express");
const router = express.Router();
const beautify = require("json-beautify");
const passport = require("passport");

const ensureAuthenticatedDEV = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error_msg", "Please log in to view that resource");
    return next();
  } else {
    res.redirect("/products/login");
  }
};

const forwardAuthenticatedDEV = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/products/dev/dashboard");
  }
};

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
    console.log("MySQL database connected.");
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
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/products/login");
});

// route GET (/products/dev/dashboard)
// desc developer's dashboard
router.get("/dev/dashboard", ensureAuthenticatedDEV, (req, res) => {
  res.render("devDashboard", {
    name: req.user.username,
  });
});

// route  GET (/products)
// desc   fetch products from database
router.get("/", ensureAuthenticatedDEV, (req, res) => {
  DB.query("SELECT * FROM products", (err, results) => {
    if (err) throw err;
    console.log(beautify(results, null, 2, 100));
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
  console.log(req.body);
  const { name, availability, cost, image, description } = req.body;

  const post = {
    name: name,
    availability: availability,
    cost: cost,
    image: image,
    description: description,
  };
  var Query = `INSERT INTO products (name, availability, cost, image, description) VALUES ("${name}",${availability},${cost},"${image}","${description}")`;
  DB.query(Query, (error, results) => {
    if (error) throw error;
    res.render("addProduct", {
      add: true,
    });
  });
});

// route  GET (/products/update)
// desc   update products in database
router.get("/update", ensureAuthenticatedDEV, (req, res) => {
  res.send("updateProduct");
});

// route  GET (/products/delete)
// desc   delete products from database
router.get("/delete", ensureAuthenticatedDEV, (req, res) => {
  res.render("deleteProduct", {
    del: false,
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

module.exports = router;
