const express = require("express");
const app = express();
const passport = require("passport");
const PORT = 5000;

// Passport Config
require("./config/passport")(passport);

// View Engine
app.set("view engine", "ejs");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Passport middleware
app.use(passport.initialize());

// Routes
app.use("/", require("./routes/home.js"));
app.use("/users", require("./routes/user.js"));

// Server
app.listen(PORT, () => console.log(`listening at port: ${PORT} for users.`));
