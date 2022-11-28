const express = require("express");
const swaggerUi = require("swagger-ui-express");

const router = express.Router();
const swaggerDocument = require("../../openapi.json");

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerDocument));

module.exports = router;
