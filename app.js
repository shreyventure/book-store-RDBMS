const express = require("express");
const PORT = process.env.PORT || 8080;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

const app = express();

// Passport Config
require("./config/passport")(passport);

// Setting up view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/products", require("./routes/products.js"));
app.get("*", (req, res) => {
  res.redirect("/products/login");
});

// Server
app.listen(PORT, console.log(`Listening at port: ${PORT}`));
