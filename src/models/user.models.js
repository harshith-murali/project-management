import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10).then((hashedPassword) => {
        this.password = hashedPassword;
        next();
    }).catch((err) => {
        next(err);
    });
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", userSchema);
