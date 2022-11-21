import mongoose from "mongoose";

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  video_id: String,
  file_id: String,
  title: String,
  itag: String,
  size: Number,
  mime_type: String,
  ext: String,
});

export default mongoose.model("File", fileSchema);
