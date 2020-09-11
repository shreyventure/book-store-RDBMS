const express = require("express");
const router = express.Router();
const beautify = require("json-beautify");
const bcrypt = require("bcrypt");

var isDev = false;
var user = "";

const ensureAuthenticated = (req, res, next) => {
  if (isDev) {
    return next();
  } else {
    res.redirect("/products/login");
  }
};

const forwardAuthenticated = (req, res, next) => {
  if (!isDev) {
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
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("devLogin", {
    attempt: false,
  });
});
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const Q = `SELECT * FROM dev WHERE username="${username}"`;
  DB.query(Q, (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      res.render("devLogin", {
        user: false,
      });
    } else {
      bcrypt.compare(password, result[0].password, function (err, Result) {
        if (Result) {
          isDev = true;
          user = username;
          res.redirect("/products/dev/dashboard");
        } else {
          res.render("devLogin", {
            attempt: true,
          });
        }
      });
    }
  });
});
router.get("/logout", (req, res) => {
  isDev = false;
  res.redirect("/products/login");
});

// route GET (/products/dev/dashboard)
// desc developer's dashboard
router.get("/dev/dashboard", ensureAuthenticated, (req, res) => {
  res.render("devDashboard", {
    name: user,
  });
});

// route  GET (/products)
// desc   fetch products from database
router.get("/", ensureAuthenticated, (req, res) => {
  DB.query("SELECT * FROM products", (err, results) => {
    if (err) throw err;
    console.log(beautify(results, null, 2, 100));
    res.json(results);
  });
});

// route  GET (/products/add)
// desc   add product to database
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addProduct", {
    add: false,
  });
});
router.post("/add", ensureAuthenticated, (req, res) => {
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
router.get("/update", ensureAuthenticated, (req, res) => {
  res.send("updateProduct");
});

// route  GET (/products/delete)
// desc   delete products from database
router.get("/delete", ensureAuthenticated, (req, res) => {
  res.render("deleteProduct", {
    del: false,
  });
});
router.post("/delete", ensureAuthenticated, (req, res) => {
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
