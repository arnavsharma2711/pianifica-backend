import * as teamsOnUsersModel from "../models/teams-on-users-model";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { CustomError } from "../lib/error/custom.error";
import type { TeamRole } from "@prisma/client";
import { getExistingTeamById } from "./team-service";
import { userSchema } from "../lib/schema/user.schema";
import { teamSchema } from "../lib/schema/team.schema";
import { createNewNotification } from "./notification-service";

export const addNewTeamMember = async ({
  userId,
  teamId,
  organizationId,
  role = "MEMBER",
  addedBy,
  isAdmin,
}: {
  userId: number;
  teamId: number;
  organizationId: number;
  role?: TeamRole;
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
        "You do not have permission to add this user to this team",
      );
    }
  }
  const existingTeam = await getExistingTeamById({
    id: teamId,
    organizationId,
  });

  const existingTeamOnUser =
    await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
      userId,
      teamId,
    });

  if (existingTeamOnUser) {
    throw new CustomError(400, "User already in team");
  }

  const teamOnUser = await teamsOnUsersModel.createTeamsOnUsers({
    userId,
    teamId,
    role,
  });

  createNewNotification({
    userId,
    notifiableType: "Team",
    notifiableId: teamId,
    status: "Added",
    variables: {
      "<team_name>": existingTeam.name,
    },
  });

  return teamOnUser;
};

export const getExistingTeamMembers = async ({
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

  const { users, total_count } =
    await teamsOnUsersModel.getTeamsOnUsersByTeamId({
      teamId,
      filters: getDefaultFilter(filters),
    });

  return {
    users: users.map((user) => ({
      ...userSchema.parse(user.user),
      role: user.role,
    })),
    total_count,
  };
};

export const getUserTeams = async ({
  userId,
  filters,
}: {
  userId: number;
  filters: FilterOptions;
}) => {
  const { teams, total_count } =
    await teamsOnUsersModel.getTeamsOnUsersByUserId({
      userId,
      filters: getDefaultFilter(filters),
    });

  return {
    teams: teams.map((team) => teamSchema.parse(team.team)),
    total_count,
  };
};

export const updateExistingTeamMemberRole = async ({
  userId,
  teamId,
  organizationId,
  role,
  updatedBy,
  isAdmin,
}: {
  userId: number;
  teamId: number;
  organizationId: number;
  role: TeamRole;
  updatedBy: number;
  isAdmin: boolean;
}) => {
  if (!isAdmin) {
    const userTeamRole =
      await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
        userId: updatedBy,
        teamId,
      });
    if (!userTeamRole || userTeamRole.role !== "MANAGER") {
      throw new CustomError(
        403,
        "You do not have permission to add this user to this team",
      );
    }
  }

  const existingTeam = await getExistingTeamById({
    id: teamId,
    organizationId,
  });

  const existingTeamOnUser =
    await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
      userId,
      teamId,
    });

  if (!existingTeamOnUser) {
    throw new CustomError(404, "User not in team");
  }

  const teamOnUser = await teamsOnUsersModel.updateTeamsOnUsersRole({
    userId,
    teamId,
    role,
  });

  createNewNotification({
    userId,
    notifiableType: "Team",
    notifiableId: teamId,
    status: role === "MANAGER" ? "Promoted" : "Demoted",
    variables: {
      "<team_name>": existingTeam.name,
    },
  });

  return teamOnUser;
};

export const removeExistingTeamMember = async ({
  userId,
  teamId,
  organizationId,
  deletedBy,
  isAdmin,
}: {
  userId: number;
  teamId: number;
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
        "You do not have permission to add this user to this team",
      );
    }
  }
  const existingTeam = await getExistingTeamById({
    id: teamId,
    organizationId,
  });

  const existingTeamOnUser =
    await teamsOnUsersModel.getTeamsOnUsersByUserIdAndTeamId({
      userId,
      teamId,
    });

  if (!existingTeamOnUser) {
    throw new CustomError(404, "User not in team");
  }

  await teamsOnUsersModel.deleteTeamsOnUsers({
    userId,
    teamId,
  });

  createNewNotification({
    userId,
    notifiableType: "Team",
    notifiableId: teamId,
    status: "Removed",
    variables: {
      "<team_name>": existingTeam.name,
    },
  });

  return;
};
