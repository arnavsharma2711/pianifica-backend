import { controllerWrapper } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../lib/schema/project.schema";
import { response } from "../middlewares/response";
import {
  addNewBookmark,
  deleteExistingBookmark,
} from "../services/bookmark-service";
import {
  checkProjectExistsByName,
  createNewProject,
  deleteExistingProject,
  getExistingProjectById,
  getExistingProjects,
  updateExistingProject,
} from "../services/project-service";
import { getExistingTasksByProjectId } from "../services/task-service";
import { getExistingProjectTeams } from "../services/teams-on-projects-service";

// POST api/project
export const createTeam = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { name, description, budget } = createProjectSchema.parse(req.body);

  const project = await createNewProject({
    organizationId: req.user.organizationId,
    name,
    description,
    budget,
    createdBy: req.user.id,
  });

  response.success({
    status: 201,
    message: "Project created successfully",
    data: project,
  });
});

// GET api/projects
export const getProjects = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const projects = await getExistingProjects({
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
    message: "Projects fetched successfully",
    data: projects,
  });
});

// GET api/project/validate
export const checkProjectExists = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const name = req.query.name as string;
  if (!name) {
    response.invalid({
      message: "Project name is required",
    });
    return;
  }

  const message = await checkProjectExistsByName({
    name,
    organizationId: req.user?.organizationId,
  });

  response.success({
    status: 200,
    message,
  });
});

// GET api/project/:id
export const getProject = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Project ID is required",
    });
    return;
  }
  const project = await getExistingProjectById({
    id: Number(id),
    organizationId: req.user.organizationId,
    userId: req.user.id,
  });

  response.success({
    status: 200,
    message: "Project fetched successfully",
    data: project,
  });
});

// POST api/project/:id/bookmark
export const bookmarkProject = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;

  await addNewBookmark({
    userId: req.user.id,
    organizationId: req.user.organizationId,
    entityType: "Project",
    entityId: Number(id),
  });

  response.success({
    status: 200,
    message: "Project bookmarked successfully",
  });
});

// DELETE api/project/:id/bookmark
export const deleteBookmark = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { id } = req.params;

  await deleteExistingBookmark({
    userId: req.user.id,
    entityType: "Project",
    entityId: Number(id),
  });

  response.success({
    status: 200,
    message: "Project bookmark deleted successfully",
  });
});

// PUT api/project/:id
export const updateProject = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Project ID is required",
    });
    return;
  }

  const { name, description, budget, status } = updateProjectSchema.parse(
    req.body,
  );

  const project = await updateExistingProject({
    id: Number(id),
    organizationId: req.user.organizationId,
    updateBody: {
      name,
      description,
      budget,
      status,
    },
  });

  response.success({
    status: 200,
    message: "Project updated successfully",
    data: project,
  });
});

// DELETE api/project/:id
export const deleteProject = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Project ID is required",
    });
    return;
  }

  await deleteExistingProject({
    id: Number(id),
    organizationId: req.user.organizationId,
  });

  response.success({
    status: 200,
    message: "Project deleted successfully",
  });
});

// GET api/project/:id/teams
export const getProjectTeams = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Project ID is required",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const teams = await getExistingProjectTeams({
    projectId: Number(id),
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
    message: "Project teams fetched successfully",
    data: teams,
  });
});

// GET api/project/:id/tasks
export const getProjectTasks = controllerWrapper(async (req) => {
  if (!req.user) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Project ID is required",
    });
    return;
  }

  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const tasks = await getExistingTasksByProjectId({
    projectId: Number(id),
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
    message: "Project tasks fetched successfully",
    data: tasks,
  });
});
