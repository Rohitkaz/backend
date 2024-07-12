import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  password: String,
});
const users = new mongoose.model("users", schema);
export default users;
