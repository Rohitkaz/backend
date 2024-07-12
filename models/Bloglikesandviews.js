import mongoose from "mongoose";

const EngagementSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  like: { type: Boolean, default: false },
  views: { type: Boolean, default: true },
});

const Engagement = mongoose.model("Engagement", EngagementSchema);
export default Engagement;
