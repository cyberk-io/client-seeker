import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    crSlug: String,
    detail: JSON,
    social: JSON,
    domain: String,
    social: String,
    website: String,
    origin: String,
    status: {
      type: String,
      enum: ["scanning", "done", "error", "trained"],
    },
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const ProjectMigration = mongoose.model("Project", ProjectSchema);

const findOneProject = async (query) => {
  return ProjectMigration.findOne(query);
};
const createOrUpdateProject = async (query, record) => {
  return ProjectMigration.findOneAndUpdate(
    query,
    {
      ...record,
      createdAt: new Date().toISOString(),
    },
    {
      upsert: true,
      new: true,
    }
  );
};

export { findOneProject, createOrUpdateProject, ProjectMigration };
