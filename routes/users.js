const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const {
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  secret,
} = require("../config/keys");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const stripe = require("stripe")(secret);

const mysql = require("mysql");
const DB = mysql.createConnection({
  multipleStatements: true,
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
router.post("/login", forwardAuthenticated, (req, res, next) => {
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
router.post("/register", forwardAuthenticated, (req, res) => {
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

router.get("/profile", ensureAuthenticated, (req, res) => {
  var name;
  if (req.user) {
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  const Q = `SELECT bookid FROM transactions WHERE userid = ${req.user.id}`;
  DB.query(Q, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      var QQ = "";
      for (let i = 0; i < result.length; i++) {
        QQ = QQ + `SELECT * FROM products WHERE id = ${result[i].bookid}; `;
      }
      DB.query(QQ, (Err, Result) => {
        if (Err) throw Err;
        if (Result) {
          res.render("profile", {
            user: req.user,
            name: name,
            purchases: Result,
          });
        }
      });
    } else {
      res.render("profile", {
        user: req.user,
        name: name,
        purchases: [],
      });
    }
  });
});
router.post("/profile", (req, res) => {
  var {
    firstName,
    lastName,
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
    !city ||
    !state ||
    !country ||
    !pincode ||
    !address
  ) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (errors.length > 0) {
    res.render("profile", {
      errors,
      user: req.user,
      name: req.user.firstName,
    });
  } else {
    const Options = {
      firstName,
      lastName,
      city,
      state,
      country,
      pincode,
      address,
    };
    const Q = `UPDATE users SET ? WHERE email = ?`;
    DB.query(Q, [Options, req.user.email], (err, result) => {
      if (err) throw err;
      req.flash("success_msg", "Profile updated successfully!");
      res.redirect("/users/profile");
    });
  }
});

// todo:  Create a success route      *******************
router.get("/success", ensureAuthenticated, async (req, res) => {
  const sessID = req.query.session_id;
  const { quantity, bookID, bookName, bookImg } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessID);
  const customer = await stripe.customers.retrieve(session.customer);
  const Q = `UPDATE products SET availability = availability - ${quantity} WHERE id = ?`;
  DB.query(Q, [bookID], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      const QQ = `INSERT INTO transactions SET ?`;
      const options = {
        userid: req.user.id,
        bookid: bookID,
        custid: session.customer,
        sessid: session.id,
        quantity: quantity,
        amount: session.amount_total / 100,
        userEmail: customer.email,
      };

      DB.query(QQ, [options], (Err, Result) => {
        if (Err) throw Err;
        if (Result) {
          res.render("success", {
            name: req.user.firstName,
            session: session,
            bookID,
            bookImg,
            bookName,
            quan: quantity,
            cust: customer,
            add: req.user.address,
          });
        }
      });
    }
  });
});

module.exports = router;
