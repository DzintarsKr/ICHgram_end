import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    caption: { type: String, default: "", trim: true, maxlength: 2200 },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema);
