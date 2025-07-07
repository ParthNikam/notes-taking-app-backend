import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);
