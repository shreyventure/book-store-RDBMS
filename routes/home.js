const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.render("home", {
    name: "guest",
  });
});

router.get("/store", async (req, res) => {
  const config = {
    method: "get",
    url: `http://localhost:8000/products/`,
  };
  results = await axios(config);
  var name;
  if (req.user) {
    name = req.user.name;
  } else {
    name = "guest";
  }
  res.render("store", {
    products: results.data,
    name: name,
    flag: true,
  });
});

router.post("/store/search", async (req, res) => {
  const { query } = req.body;
  const config = {
    method: "get",
    url: `http://localhost:8000/products/`,
  };
  results = await axios(config);
  var data = results.data;
  var books = [];
  var flag = false;
  for (var i = 0; i < data.length; i++) {
    let book = data[i].name;
    if (book.toLowerCase().includes(query.toLowerCase())) {
      books.push(data[i]);
      flag = true;
    }
  }
  var name;
  if (req.user) {
    name = req.user.name;
  } else {
    name = "guest";
  }
  res.render("store", {
    products: books,
    name: name,
    flag: flag,
  });
});

module.exports = router;
