const express = require("express");
const PORT = 8080;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

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

// Routes
app.use("/products", require("./routes/products.js"));

// Server
app.listen(PORT, console.log(`Listening at port: ${PORT}`));
