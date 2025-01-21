import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    crProjectSlug: String,
    data: JSON,
    crProjectType: String,
    dataType: {
      type: String,
      enum: ["new", "process", "done"],
    },
    hash: String,
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const Project = mongoose.model("rawDataProjectCryptorank", ProjectSchema);

const findProject = async (query) => {
  return await Project.findOne(query);
};

const createOrUpdateProject = async (query, record) => {
  return await Project.findOneAndUpdate(
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

export { findProject, createOrUpdateProject };
