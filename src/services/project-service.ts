import { CustomError } from "../lib/error/custom.error";
import * as projectModel from "../models/project-model";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import type { ProjectStatus } from "@prisma/client";
import { projectSchema } from "../lib/schema/project.schema";

export const createNewProject = async ({
  name,
  description,
  budget,
  organizationId,
  createdBy,
}: {
  name: string;
  description?: string;
  budget?: number;
  organizationId: number;
  createdBy: number;
}) => {
  const existingProject = await projectModel.getProjectByName({
    name,
    organizationId,
  });

  if (existingProject) {
    throw new CustomError(400, "Project with this name already exists");
  }

  const project = await projectModel.createProject({
    name,
    description,
    budget,
    organizationId,
    createdBy,
  });

  return projectSchema.parse(project);
};

export const getExistingProjects = async ({
  organizationId,
  filters,
  fetchDeleted = false,
}: {
  organizationId: number;
  filters: FilterOptions;
  fetchDeleted?: boolean;
}) => {
  const { projects, total_count } = await projectModel.getProjects({
    organizationId,
    filters: getDefaultFilter(filters),
    fetchDeleted,
  });

  return {
    projects: projects.map((project) => projectSchema.parse(project)),
    total_count,
  };
};

export const getExistingProjectById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  const project = await projectModel.getProjectById({
    id,
    organizationId,
  });

  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  return projectSchema.parse(project);
};

export const getExistingProjectByName = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: number;
}) => {
  const project = await projectModel.getProjectByName({
    name,
    organizationId,
  });

  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  return projectSchema.parse(project);
};

export const checkProjectExistsByName = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: number;
}) => {
  const project = await projectModel.getProjectByName({
    name,
    organizationId,
  });

  if (project) {
    throw new CustomError(400, "Project with this name already exists");
  }

  return "Project does not exist";
};

export const updateExistingProject = async ({
  id,
  organizationId,
  updateBody,
}: {
  id: number;
  organizationId: number;
  updateBody: {
    name?: string;
    description?: string;
    budget?: number;
    status?: ProjectStatus;
  };
}) => {
  await getExistingProjectById({ id, organizationId });

  const updatedProject = await projectModel.updateProject({
    id,
    body: updateBody,
  });

  return projectSchema.parse(updatedProject);
};

export const deleteExistingProject = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  await getExistingProjectById({ id, organizationId });
  await projectModel.deleteProject({ id });
};
