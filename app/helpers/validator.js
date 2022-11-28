import { ReqError } from "./appError.js";
import errorCodes from "../constants/errorCodes.js";

function validate(schema, data) {
  const { error } = schema.validate(data);
  if (error) {
    const { details } = error;
    const { key } = details[0].context;
    const message = details.map((i) => i.message).join(",");
    throw new ReqError(errorCodes.INVALID_SCHEMA, { message: message, flag: key }, 400);
  }
  return true;
}

export default validate;
