const userService = require("../services/user-service");

module.exports = {
  async checkTakenCredential(req, res) {
    try {
      const result = await userService.checkTakenCredential(req.query);
      res.status(200).json(result);
    } catch (errors) {
      res.status(errors.code).json(errors);
    }
  },
};
