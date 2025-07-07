import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  notebookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notebook',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
