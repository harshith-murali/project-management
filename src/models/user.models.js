import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localPath: ``,
      },
    },
    refreshToken: { type: String, default: "" },
    forgotPasswordToken: { type: String, default: "" },
    forgotPasswordTokenExpiry: { type: Date, default: null },
    emailVerificationToken: { type: String, default: "" },
    emailVerificationTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, username: this.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION },
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20 minutes from now

  return { unHashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);

export default User;
