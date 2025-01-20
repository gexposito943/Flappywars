import { body } from "express-validator";
import { validationResult } from "express-validator";

export const sanitizeData = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    body(key).trim().escape();
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};
