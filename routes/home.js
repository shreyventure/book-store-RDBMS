const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.send("HOME");
});

router.get("/books", async (req, res) => {
  const config = {
    method: "get",
    url: `http://localhost:8000/products/`,
  };

  results = await axios(config);

  res.json({ data: results.data });
});

module.exports = router;
