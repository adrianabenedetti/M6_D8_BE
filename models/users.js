import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      max: 255,
    },

    lastname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: false,
      default: "user"
    },
    age: {
      type: Number,
      required: false,
      default: 0,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
  }
);

const UserModel = mongoose.model("User", UserSchema, "users");

export default UserModel;
