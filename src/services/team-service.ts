import { CustomError } from "../lib/error/custom.error";
import * as teamModel from "../models/team-model";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { teamSchema } from "../lib/schema/team.schema";
import { getTeamsOnUsersByUserIdAndTeamId } from "../models/teams-on-users-model";
import { addNewTeamMember } from "./teams-on-users-service";
import { createNewNotification } from "./notification-service";

export const createNewTeam = async ({
  name,
  organizationId,
  description,
  createdBy,
}: {
  name: string;
  organizationId: number;
  description?: string;
  createdBy: number;
}) => {
  const existingTeam = await teamModel.getTeamByName({ name, organizationId });

  if (existingTeam) {
    throw new CustomError(400, "Team already exists");
  }

  const team = await teamModel.createTeam({
    name,
    organizationId,
    description,
  });

  addNewTeamMember({
    userId: createdBy,
    teamId: team.id,
    organizationId,
    role: "MANAGER",
    isAdmin: true,
    addedBy: createdBy,
  });

  createNewNotification({
    userId: createdBy,
    notifiableType: "Team",
    notifiableId: team.id,
    status: "Created",
    variables: {
      "<team_name>": team.name,
    },
  });

  return teamSchema.parse(team);
};

export const getExistingTeamsByOrganizationId = async ({
  organizationId,
  filters,
  fetchDeleted = false,
}: {
  organizationId: number;
  filters: FilterOptions;
  fetchDeleted?: boolean;
}) => {
  const { teams, total_count } = await teamModel.getTeamsByOrganizationId({
    organizationId,
    filters: getDefaultFilter(filters),
    fetchDeleted,
  });

  return { teams: teams.map((team) => teamSchema.parse(team)), total_count };
};

export const getExistingTeamById = async ({
  id,
  organizationId,
}: {
  id: number;
  organizationId: number;
}) => {
  const team = await teamModel.getTeamById({ id, organizationId });

  if (!team) {
    throw new CustomError(404, "Team not found");
  }

  return team;
};

export const getExistingTeamByName = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: number;
}) => {
  const team = await teamModel.getTeamByName({ name, organizationId });

  if (!team) {
    throw new CustomError(404, "Team not found");
  }

  return team;
};

export const checkTeamExistsByName = async ({
  name,
  organizationId,
}: {
  name: string;
  organizationId: number;
}) => {
  const team = await teamModel.getTeamByName({ name, organizationId });

  if (team) {
    throw new CustomError(400, "Team already exists");
  }

  return "Team does not exist";
};

export const updateExistingTeam = async ({
  id,
  organizationId,
  name,
  description,
  updatedBy,
  isAdmin = false,
}: {
  id: number;
  organizationId: number;
  name?: string;
  description?: string;
  updatedBy: number;
  isAdmin?: boolean;
}) => {
  const existingTeam = await getExistingTeamById({ id, organizationId });
  if (!existingTeam) {
    throw new CustomError(404, "Team not found");
  }
  if (!isAdmin) {
    const userTeamRole = await getTeamsOnUsersByUserIdAndTeamId({
      userId: updatedBy,
      teamId: id,
    });
    if (!userTeamRole || userTeamRole.role !== "MANAGER") {
      throw new CustomError(
        403,
        "You do not have permission to update this team",
      );
    }
  }
  if (name) {
    if (await teamModel.getTeamByName({ name, organizationId })) {
      throw new CustomError(400, `Team with name: ${name} already exists`);
    }
  }

  const team = await teamModel.updateTeam({
    id,
    updateBody: { name, description },
  });

  return team;
};

export const deleteExistingTeam = async ({
  id,
  organizationId,
  deletedBy,
  isAdmin,
}: {
  id: number;
  organizationId: number;
  deletedBy: number;
  isAdmin?: boolean;
}) => {
  const existingTeam = await getExistingTeamById({ id, organizationId });
  if (!existingTeam) {
    throw new CustomError(404, "Team not found");
  }
  if (!isAdmin) {
    const userTeamRole = await getTeamsOnUsersByUserIdAndTeamId({
      userId: deletedBy,
      teamId: id,
    });
    if (!userTeamRole || userTeamRole.role !== "MANAGER") {
      throw new CustomError(
        403,
        "You do not have permission to update this team",
      );
    }
  }
  const team = await teamModel.deleteTeam({ id });

  return team;
};
