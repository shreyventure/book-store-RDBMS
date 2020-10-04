const express = require("express");
const router = express.Router();
const axios = require("axios");
const { public, secret } = require("../config/keys");
const stripe = require("stripe")(secret);
const { ensureAuthenticated } = require("../config/auth");

router.get("/", (req, res) => {
  var name;
  if (req.user) {
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  res.render("home", {
    name: name,
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
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  res.render("store", {
    products: results.data,
    name: name,
    flag: true,
  });
});
router.get("/store/:id", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const config = {
    method: "get",
    url: `http://localhost:8000/products/`,
  };
  results = await axios(config);
  var name;
  if (req.user) {
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  var data = results.data;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      var desc = data[i].description.replace(/<(?:.|\n)*?>/gm, "");
      res.render("book", {
        name: name,
        product: data[i],
        desc: desc,
        key: public,
      });
    }
  }
});
router.post("/charge/", ensureAuthenticated, async (req, res) => {
  const { amt, quan, title, bookID, bookName, bookImg } = req.query;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: title,
          },
          unit_amount: amt * 100,
        },
        quantity: quan,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:5000/users/success?session_id={CHECKOUT_SESSION_ID}&quantity=${quan}&bookID=${bookID}&bookName=${bookName}&bookImg=${bookImg}`,
    cancel_url: `http://localhost:5000/store/${bookID}`,
  });
  res.json({ id: session.id });
});
router.post("/store/search", ensureAuthenticated, async (req, res) => {
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
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  res.render("store", {
    products: books,
    name: name,
    flag: flag,
  });
});

router.get("/offers", (req, res) => {
  var name;
  if (req.user) {
    name = req.user.firstName;
  } else {
    name = "guest";
  }
  res.render("offer", {
    name,
  });
});

module.exports = router;
