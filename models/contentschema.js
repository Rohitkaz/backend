import mongoose from "mongoose";

const contentschema = new mongoose.Schema({
  title: {
    type: String,
  },
  text: {
    type: String,
  },
});
export default contentschema;
