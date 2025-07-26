import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    name: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);