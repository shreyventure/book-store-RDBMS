const express = require("express");
const PORT = 8080;
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

// Setting up view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Routes ------------------------
// Home
app.use("/", require("./routes/index.js"));

// User login and register
app.use("/users", require("./routes/users.js"));

// Products
app.use("/products", require("./routes/products.js"));
// ---------------------------------

// Server

app.listen(PORT, console.log(`Listening at port: ${PORT}`));
