import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  createdAt: { type: Date, default: Date.now },
});

const blogModel = mongoose.model("Blog", blogSchema);
export { blogModel };