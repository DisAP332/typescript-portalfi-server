import { Schema, model } from "mongoose";

interface IUser {
  username: string;
  password: string;
  id: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    ref: "username",
  },
  password: {
    type: String,
    required: true,
    ref: "password",
  },
  id: {
    type: String,
    required: false,
  },
});

const User = model<IUser>("User", userSchema);

userSchema.virtual("url").get(function () {
  return `/drinks/${this._id}`;
});

export default User;
