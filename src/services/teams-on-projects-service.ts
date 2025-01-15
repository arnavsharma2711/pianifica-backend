import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import * as teamsOnUsersModel from "../models/teams-on-users-model";
import * as teamsOnProjectsModel from "../models/teams-on-projects-model";
import { getExistingTeamById } from "./team-service";
import { getExistingProjectById } from "./project-service";
import { teamSchema } from "../lib/schema/team.schema";
import { projectSchema } from "../lib/schema/project.schema";
import { createMultipleNotifications } from "./notification-service";

const generateTeamNotification = async ({
  projectId,
  teamId,
  status,
  variables,
}: {
  projectId: number;
  teamId: number;
  status: string;
  variables: Record<string, string>;
}) => {
  const result = await teamsOnUsersModel.getAllTeamsOnUsersByTeamId({
    teamId,
  });
  const userIds = result.map((record) => record.userId);

  if (userIds.length > 0) {
    await createMultipleNotifications({
      userIds,
      notifiableType: "Project",
      notifiableId: projectId,
      status,
      variables,
    });
  }
};

export const assigneeNewTeamProject = async ({
  teamId,
  projectId,
  organizationId,
  addedBy,
  isAdmin,
}: {
  teamId: number;
  projectId: number;
  organizationId: number;
  addedBy: number;
  isAdmin: boolean;
}) => {
  if (!isAdmin) {
    const userTeamRole =
      await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
        userId: addedBy,
        teamId,
      });
    if (!userTeamRole || userTeamRole.role !== "MANAGER") {
      throw new CustomError(
        403,
        "You do not have permission to assignee this project to this team",
      );
    }
  }

  const project = await getExistingProjectById({
    id: projectId,
    organizationId,
  });

  const team = await getExistingTeamById({ id: teamId, organizationId });

  const existingTeamOnProject =
    await teamsOnProjectsModel.getTeamsOnProjectsByTeamIdAndProjectId({
      teamId,
      projectId,
    });
  if (existingTeamOnProject) {
    throw new CustomError(400, "Project already assigned to team");
  }
  await teamsOnProjectsModel.createTeamsOnProjects({
    teamId,
    projectId,
  });

  generateTeamNotification({
    projectId,
    teamId,
    status: "Assigned",
    variables: {
      "<team_name>": team.name,
      "<project_name>": project.name,
    },
  });
};

export const getExistingTeamProjects = async ({
  teamId,
  organizationId,
  filters,
}: {
  teamId: number;
  organizationId: number;
  filters: FilterOptions;
}) => {
  const team = await getExistingTeamById({ id: teamId, organizationId });
  if (!team) {
    throw new CustomError(404, "Team not found");
  }

  const { projects, total_count } =
    await teamsOnProjectsModel.getTeamsOnProjectsByTeamId({
      teamId,
      filters: getDefaultFilter(filters),
    });

  return {
    projects: projects.map((project) => projectSchema.parse(project.project)),
    total_count,
  };
};

export const getExistingProjectTeams = async ({
  projectId,
  organizationId,
  filters,
}: {
  projectId: number;
  organizationId: number;
  filters: FilterOptions;
}) => {
  const project = await getExistingProjectById({
    id: projectId,
    organizationId,
  });
  if (!project) {
    throw new CustomError(404, "Project not found");
  }

  const { teams, total_count } =
    await teamsOnProjectsModel.getTeamsOnProjectsByProjectId({
      projectId,
      filters: getDefaultFilter(filters),
    });

  return {
    teams: teams.map((team) => teamSchema.parse(team.team)),
    total_count,
  };
};

export const removeExistingTeamProject = async ({
  teamId,
  projectId,
  organizationId,
  deletedBy,
  isAdmin,
}: {
  teamId: number;
  projectId: number;
  organizationId: number;
  deletedBy: number;
  isAdmin: boolean;
}) => {
  if (!isAdmin) {
    const userTeamRole =
      await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
        userId: deletedBy,
        teamId,
      });
    if (!userTeamRole || userTeamRole.role !== "MANAGER") {
      throw new CustomError(
        403,
        "You do not have permission to assignee this project to this team",
      );
    }
  }

  const project = await getExistingProjectById({
    id: projectId,
    organizationId,
  });

  const team = await getExistingTeamById({ id: teamId, organizationId });

  const existingTeamOnProject =
    await teamsOnProjectsModel.getTeamsOnProjectsByTeamIdAndProjectId({
      teamId,
      projectId,
    });
  if (!existingTeamOnProject) {
    throw new CustomError(404, "Project not assigned to team");
  }
  await teamsOnProjectsModel.deleteTeamsOnProjects({
    teamId,
    projectId,
  });

  generateTeamNotification({
    projectId,
    teamId,
    status: "Unassigned",
    variables: {
      "<team_name>": team.name,
      "<project_name>": project.name,
    },
  });
};
