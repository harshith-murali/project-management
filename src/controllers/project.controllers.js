import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.models.js";
import Project from "../models/project.model.js";
import ProjectMember from "../models/projectmember.model.js";
import Task from "../models/task.model.js";
import ProjectNote from "../models/projectnote.model.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { pipe } from "zod";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectDetails",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "members",
            },
          },
          {
            $addFields: {
              membersCount: { $size: "$members" },
            },
          },
          {
            $project: {
              members: 0, // remove full members array
            },
          },
        ],
      },
    },
    { $unwind: "$projectDetails" },
    {
      $project: {
        _id: 0,
        role: 1,
        project: {
          _id: "$projectDetails._id",
          name: "$projectDetails.name",
          description: "$projectDetails.description",
          createdBy: "$projectDetails.createdBy",
          createdAt: "$projectDetails.createdAt",
          updatedAt: "$projectDetails.updatedAt",
          membersCount: "$projectDetails.membersCount",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });

  if (!membership) {
    throw new ApiError(403, "Access denied");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const existing = await Project.findOne({ name });
  if (existing) {
    throw new ApiError(400, "Project name already exists");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await Project.create(
      [
        {
          name,
          description,
          createdBy: userId,
        },
      ],
      { session },
    );

    await ProjectMember.create(
      [
        {
          user: userId,
          project: project[0]._id,
          role: UserRolesEnum.ADMIN,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, project[0], "Project created successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Project creation failed");
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
    role: "ADMIN",
  });

  if (!membership) {
    throw new ApiError(403, "Only admin can update project");
  }

  // Optional duplicate name check
  const existing = await Project.findOne({
    name,
    _id: { $ne: projectId },
  });

  if (existing) {
    throw new ApiError(400, "Project name already exists");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { name, description },
    { new: true },
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Check admin permission
  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
    role: "ADMIN",
  });

  if (!membership) {
    throw new ApiError(403, "Only admin can delete project");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Delete related data first
  await ProjectMember.deleteMany({ project: projectId });
  // delete tasks and notes related to the project
  await Task.deleteMany({ project: projectId });
  await ProjectNote.deleteMany({ project: projectId });

  await Project.findByIdAndDelete(projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;
  const currentUserId = req.user._id;

  // Check if current user is admin of the project
  const adminCheck = await ProjectMember.findOne({
    user: currentUserId,
    project: projectId,
    role: "ADMIN",
  });
  // Only admin can add/update members
  if (!adminCheck) {
    throw new ApiError(403, "Only admin can add members");
  }

  // Find user by email
  const user = await User.findOne({ email });
  // If user not found, return error
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Add or update project member
  const member = await ProjectMember.findOneAndUpdate(
    { user: user._id, project: projectId },
    { role },
    { new: true, upsert: true },
  );
  // Return success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, member, "Project member added/updated successfully"),
    );
});

const getProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Authorization check
  const membership = await ProjectMember.findOne({
    user: userId,
    project: projectId,
  });

  if (!membership) {
    throw new ApiError(403, "Access denied");
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
    {
      $project: {
        project: 1,
        role: 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project members fetched successfully",
      ),
    );
});

const updateProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;
  const currentUserId = req.user._id;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid role");
  }

  // Check admin permission
  const adminCheck = await ProjectMember.findOne({
    project: projectId,
    user: currentUserId,
    role: "ADMIN",
  });

  if (!adminCheck) {
    throw new ApiError(403, "Only admin can update roles");
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  projectMember.role = newRole;
  await projectMember.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member role updated successfully",
      ),
    );
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const currentUserId = req.user._id;

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  // If user is removing themselves → allow
  if (userId.toString() === currentUserId.toString()) {
    await projectMember.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "You have left the project successfully"),
      );
  }

  // Otherwise check admin permission
  const adminCheck = await ProjectMember.findOne({
    user: currentUserId,
    project: projectId,
    role: "ADMIN",
  });

  if (!adminCheck) {
    throw new ApiError(403, "Only admin can remove other members");
  }

  await projectMember.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Project member removed successfully"));
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMember,
  addProjectMember,
  updateProjectMember,
  deleteProjectMember,
};
