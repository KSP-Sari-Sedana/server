const validateService = require('../services/validate-service');

module.exports = {
  checkFormatDataType(req, res) {
    try {
      const result = validateService.checkFormatDataType(req.query);
      res.status(200).json(result);
    } catch (errors) {
      res.status(errors.code).json(errors);
    }
  },
};
