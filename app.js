const express = require("express");
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("HOME");
});

app.listen(PORT, () => console.log(`listening at port: ${PORT} for users.`));
