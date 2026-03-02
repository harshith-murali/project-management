import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import {
  forgotPassword,
  refreshAccessToken,
  registerUser,
  verifyEmail,
  resetForgotPassword,
  getCurrentUser,
  resendEmailVerification
} from "../controllers/auth.controllers.js";
import { registerSchema } from "../validators/index.js";
import { loginUser } from "../controllers/auth.controllers.js";
import { loginSchema } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { logoutUser } from "../controllers/auth.controllers.js";
import { userForgotPasswordSchema } from "../validators/index.js";
import { userChangeCurrentPasswordSchema } from "../validators/index.js";
import { changeCurrentPassword } from "../controllers/auth.controllers.js";
const router = Router();
// unsecure routes
router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(validate(userForgotPasswordSchema), forgotPassword);

router
  .route("/reset-password/:resetToken")
  .post(validate(userForgotPasswordSchema), resetForgotPassword);

// secure routes with JWT middleware
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    validate(userChangeCurrentPasswordSchema),
    changeCurrentPassword,
  );
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);

export default router;
