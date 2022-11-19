const express = require("express");
const router = express.Router();
const swagger = require("swagger-ui-express");
const swaggerDocument = require("../../openapi.json");

const userRoutes = require("./user-route");
const validateRoutes = require("./validate-route");

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});
router.use("/openapi", swagger.serve);
router.get("/openapi", swagger.setup(swaggerDocument));

router.use("/users", userRoutes);
router.use("/validate", validateRoutes);

module.exports = router;
