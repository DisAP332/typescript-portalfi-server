import { Schema, Connection, Model } from "mongoose";

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

userSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

const MODEL_NAME = "User";

const getUserModel = (connection: Connection): Model<IUser> =>
  (connection.models[MODEL_NAME] as Model<IUser>) ??
  connection.model<IUser>(MODEL_NAME, userSchema);

export default getUserModel;
