const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const {
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = require("../devloper/config/keys");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

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
    console.log("MySQL database connected for user's register.");
  }
});

router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    name: "guest",
  });
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: `/store`,
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register", {
    name: "guest",
  });
});
router.post("/register", (req, res) => {
  var {
    firstName,
    lastName,
    email,
    password,
    password2,
    city,
    state,
    country,
    pincode,
    address,
  } = req.body;
  let errors = [];

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !password2 ||
    !city ||
    !state ||
    !country ||
    !pincode ||
    !address
  ) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      firstName,
      lastName,
      email,
      password,
      password2,
      city,
      state,
      country,
      pincode,
      address,
      name: "guest",
    });
  } else {
    const Q = `SELECT * FROM users WHERE email = "${email}"`;
    DB.query(Q, (err, result) => {
      if (err) throw err;
      if (result[0]) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          firstName,
          lastName,
          email,
          password,
          password2,
          city,
          state,
          country,
          pincode,
          address,
          name: "guest",
        });
        return;
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            password = hash;
            const Query = "INSERT INTO users SET ?";
            const Options = {
              firstName,
              lastName,
              email,
              password,
              city,
              state,
              country,
              pincode,
              address,
            };
            DB.query(Query, Options, (err, result) => {
              if (err) throw err;
              if (result) {
                req.flash(
                  "success_msg",
                  "You are now registered. Please log in to continue."
                );
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

module.exports = router;
