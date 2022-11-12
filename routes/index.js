const express = require("express");
const router = express.Router();
const swagger = require("swagger-ui-express");
const swaggerDocument = require("../openapi.json");

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});

router.use("/api/openapi", swagger.serve);
router.get("/api/openapi", swagger.setup(swaggerDocument));

module.exports = router;
