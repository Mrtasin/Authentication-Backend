import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationToken: String,

    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    passwordExpried: Date,
  },
  {
    timestamps: true,
  }
);

authSchema.pre("save", async function(next) {
  if (this.isModified ("password")) {
    this.password = await bcrypt.hash(this.password, 10) 
  }
  next()
})


const Auth = mongoose.model("Auth", authSchema);


export { Auth };
