import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import {
  registerUser,
  generateAccessAndRefreshTokens,
} from "../controllers/auth.controllers.js";

import { registerSchema } from "../validators/index.js";

const router = Router();

router
  .route("/register")
  .post(registerSchema, validate(registerSchema), registerUser);

export default router;
