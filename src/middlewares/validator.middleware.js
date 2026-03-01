import { ZodError } from "zod";
import ApiError from "../utils/api-error.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const extractedErrors = error.errors.map((err) => ({
        [err.path.join(".")]: err.message,
      }));

      throw new ApiError(422, "Received data is not valid", extractedErrors);
    }

    next(error);
  }
};
