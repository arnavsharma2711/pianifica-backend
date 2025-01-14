import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import { createTeamSchema } from "../lib/schema/team.schema";
import { response } from "../middlewares/response";
import {
  checkTeamExistsByName,
  createNewTeam,
  deleteExistingTeam,
  getExistingTeamById,
  getExistingTeamsByOrganizationId,
  updateExistingTeam,
} from "../services/team-service";
import {
  addNewTeamMember,
  getExistingTeamMembers,
  getUserTeams,
  removeExistingTeamMember,
} from "../services/teams-on-users-service";
import { isOrgSuperAdmin } from "../utils/commonUtils";

// POST api/team
export const createTeam = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { name, description } = createTeamSchema.parse(req.body);

  const team = await createNewTeam({
    name,
    organizationId: req.user.organizationId,
    description,
    createdBy: req.user.id,
  });

  response.success({
    status: 201,
    message: "Team created successfully",
    data: team,
  });
});

// GET api/teams
export const getTeams = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  console.log(req.query);
  const { query, page, limit, orderBy, order, fetchDeleted } =
    filterSchema.parse(req.query);
  const teams = await getExistingTeamsByOrganizationId({
    organizationId: req.user.organizationId,
    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
    },
    fetchDeleted: isOrgSuperAdmin(req.user.userRoles) && fetchDeleted,
  });

  response.success({
    status: 200,
    message: "Teams fetched successfully",
    data: teams,
  });
});

// GET api/teams/users
export const getTeamUsers = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const teams = await getUserTeams({
    userId: req.user.id,
    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
    },
  });

  response.success({
    status: 200,
    message: "Teams fetched successfully",
    data: teams,
  });
});

// GET api/team/validate
export const checkTeamExists = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const name = req.query.name as string;
  if (!name) {
    response.invalid({
      message: "Team name is required",
    });
    return;
  }

  const message = await checkTeamExistsByName({
    name,
    organizationId: req.user?.organizationId,
  });

  response.success({
    status: 200,
    message,
  });
});

// GET api/team/:id
export const getTeamById = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team name is required",
    });
    return;
  }

  const team = await getExistingTeamById({
    id: Number(id),
    organizationId: req.user?.organizationId,
  });

  response.success({
    status: 200,
    message: "Team fetched successfully",
    data: team,
  });
});

// PUT api/team/:id
export const updateTeam = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team id is required",
    });
    return;
  }

  const { name, description } = req.body;

  const team = await updateExistingTeam({
    id: Number(id),
    organizationId: req.user?.organizationId,
    name,
    description,
    updatedBy: req.user?.id,
    isAdmin: req.user?.isAdmin,
  });

  response.success({
    status: 200,
    message: "Team updated successfully",
    data: team,
  });
});

// DELETE api/team/:id
export const deleteTeam = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team id is required",
    });
    return;
  }

  await deleteExistingTeam({
    id: Number(id),
    organizationId: req.user?.organizationId,
    deletedBy: req.user?.id,
    isAdmin: req.user?.isAdmin,
  });

  response.success({
    status: 200,
    message: "Team deleted successfully",
  });
});

// POST api/team/:id/member
export const addTeamMember = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team id is required",
    });
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  const team = await addNewTeamMember({
    userId: Number(userId),
    teamId: Number(id),
    addedBy: req.user.id,
    isAdmin: req.user.isAdmin,
  });

  response.success({
    status: 200,
    message: "Team member added successfully",
    data: team,
  });
});

// DELETE api/team/:id/member
export const removeTeamMember = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team id is required",
    });
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    response.invalid({
      message: "User id is required",
    });
    return;
  }

  await removeExistingTeamMember({
    userId: Number(userId),
    teamId: Number(id),
    deletedBy: req.user.id,
    isAdmin: req.user.isAdmin,
  });

  response.success({
    status: 200,
    message: "Team member removed successfully",
  });
});

// GET api/team/:id/members
export const getTeamMembers = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Team id is required",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const members = await getExistingTeamMembers({
    teamId: Number(id),
    organizationId: req.user.organizationId,
    filters: {
      query,
      page,
      limit,
      orderBy,
      order,
    },
  });

  response.success({
    status: 200,
    message: "Team members fetched successfully",
    data: members,
  });
});
