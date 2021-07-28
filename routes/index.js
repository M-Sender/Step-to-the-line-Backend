const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "Up with no issues" }).status(200);
});



module.exports = router;