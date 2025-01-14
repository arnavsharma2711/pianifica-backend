import { controllerWrapper, type UserRequest } from "../lib/controllerWrapper";
import { filterSchema } from "../lib/schema/filter.schema";
import {
  createOrganizationSchema,
  organizationSchema,
  updateOrganizationSchema,
} from "../lib/schema/organization.schema";
import { createUserSchema } from "../lib/schema/user.schema";
import { response } from "../middlewares/response";
import {
  checkOrganizationExistsByName,
  createNewOrganization,
  deleteExistingOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateExistingOrganization,
} from "../services/organization-service";
import {
  demoteUserToMember,
  promoteUserToAdmin,
} from "../services/user-role-service";
import { isOrgSuperAdmin, isSuperAdmin } from "../utils/commonUtils";

const authorization = (req: UserRequest, organizationId: number): boolean => {
  if (!req.user) return false;

  const { userRoles, organizationId: userOrgId } = req.user;

  return (
    isSuperAdmin(userRoles) ||
    (userOrgId === organizationId && isOrgSuperAdmin(userRoles))
  );
};

// POST api/organization/?withUser=boolean
export const createOrganization = controllerWrapper(async (req) => {
  const { withUser = false } = req.query;
  const { name, description, address, phone, email, website } =
    createOrganizationSchema.parse(req.body);

  const user =
    withUser === "true" ? createUserSchema.parse(req.body?.user) : undefined;

  const organization = await createNewOrganization({
    name,
    description,
    address,
    phone,
    email,
    website,
    user,
  });

  response.success({
    status: 201,
    message: "Organization created successfully",
    data: organization,
  });
});

// POST api/organization/:id/promoteUser
export const promoteUser = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Organization id is required",
    });
    return;
  }

  const { username } = req.body;
  if (!username) {
    response.invalid({
      message: "username is required",
    });
    return;
  }

  if (!authorization(req, Number(id))) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  await promoteUserToAdmin({ username, organizationId: Number(id) });

  response.success({
    status: 200,
    message: "User promoted successfully",
  });
});

// POST api/organization/:id/demoteUser
export const demoteUser = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Organization id is required",
    });
    return;
  }

  const { username } = req.body;
  if (!username) {
    response.invalid({
      message: "username is required",
    });
    return;
  }

  if (!authorization(req, Number(id))) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  await demoteUserToMember({ username, organizationId: Number(id) });

  response.success({
    status: 200,
    message: "User promoted successfully",
  });
});

// GET api/organization/exists/?name=organizationName
export const checkOrganizationExists = controllerWrapper(async (req) => {
  const name = req.query.name as string;
  if (!name) {
    response.invalid({
      message: "Organization name is required",
    });
    return;
  }

  const message = await checkOrganizationExistsByName({ name: name });

  response.success({
    status: 200,
    message,
  });
});

// GET api/organizations
export const getOrganizations = controllerWrapper(async (req) => {
  const { query, page, limit, orderBy, order } = filterSchema.parse(req.query);
  const organizations = await getAllOrganizations({
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
    message: "Organizations fetched successfully",
    data: organizations,
  });
});

// GET api/organization
export const getOrganization = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Organization id is required",
    });
    return;
  }

  const organization = await getOrganizationById({ id: Number(id) });

  response.success({
    status: 200,
    message: "Organization fetched successfully",
    data: organizationSchema.parse(organization),
  });
});

// PUT api/organization/:id
export const updateOrganization = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Organization id is required",
    });
    return;
  }
  if (!authorization(req, Number(id))) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  const { name, description, address, phone, email, website } =
    updateOrganizationSchema.parse(req.body);

  const organization = await updateExistingOrganization({
    id: Number(id),
    name,
    description,
    address,
    phone,
    email,
    website,
  });

  response.success({
    status: 200,
    message: "Organization updated successfully",
    data: organizationSchema.parse(organization),
  });
});

// DELETE api/organization/:id
export const deleteOrganization = controllerWrapper(async (req) => {
  const { id } = req.params;
  if (!id) {
    response.invalid({
      message: "Organization id is required",
    });
    return;
  }
  if (!authorization(req, Number(id))) {
    response.unauthorized({
      message: "You are not authorized to perform this action",
    });
    return;
  }

  await deleteExistingOrganization({ id: Number(id) });

  response.success({
    status: 200,
    message: "Organization deleted successfully",
  });
});
