const express = require("express");
const router = express.Router();
const swagger = require("swagger-ui-express");
const swaggerDocument = require("../../openapi.json");

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});
router.use("/openapi", swagger.serve);
router.get("/openapi", swagger.setup(swaggerDocument));

module.exports = router;
