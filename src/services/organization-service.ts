import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { organizationSchema } from "../lib/schema/organization.schema";
import { userSchema } from "../lib/schema/user.schema";
import * as organizationModel from "../models/organization-model";
import { checkUserExistsByEmail, createNewUser } from "./user-service";

export const createNewOrganization = async ({
  name,
  description,
  address,
  phone,
  email,
  website,
  user,
}: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  user?: {
    firstName: string;
    lastName?: string;
    username: string;
    email: string;
    password: string;
    profilePictureUrl?: string;
    phone?: string;
    designation?: string;
  };
}) => {
  if (await organizationModel.getOrganizationByName({ name })) {
    throw new CustomError(400, "Organization with this name already exists");
  }

  if (user && (await checkUserExistsByEmail({ email: user.email }))) {
    throw new CustomError(400, "User with this email already exists");
  }

  const organization = await organizationModel.createOrganization({
    name,
    description,
    address,
    phone,
    email,
    website,
  });

  if (user) {
    const createdUser = await createNewUser({
      organizationId: organization.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      profilePictureUrl: user.profilePictureUrl,
      phone: user.phone,
      designation: user.designation,
      role: "ORG_SUPER_ADMIN",
    });

    return {
      user: userSchema.parse(createdUser),
      organization: organizationSchema.parse(organization),
    };
  }

  return organizationSchema.parse(organization);
};

export const getOrganizationById = async ({ id }: { id: number }) => {
  const organization = await organizationModel.getOrganizationById({ id });

  if (!organization) {
    throw new CustomError(404, "Organization not found");
  }

  return organizationSchema.parse(organization);
};

export const getOrganizationByName = async ({ name }: { name: string }) => {
  const organization = await organizationModel.getOrganizationByName({ name });

  if (!organization) {
    throw new CustomError(404, "Organization not found");
  }

  return organizationSchema.parse(organization);
};

export const getAllOrganizations = async ({
  filters,
}: {
  filters: FilterOptions;
}) => {
  const { organizations, total_count } =
    await organizationModel.getAllOrganizations({
      filters: getDefaultFilter(filters),
    });

  const organizationsData = organizations.map((organization) =>
    organizationSchema.parse(organization),
  );

  return { organizationsData, total_count };
};

export const checkOrganizationExistsByName = async ({
  name,
}: {
  name: string;
}) => {
  const organization = await organizationModel.getOrganizationByName({ name });

  if (organization) {
    throw new CustomError(400, "Organization with this name already exists");
  }

  return "Organization does not exist";
};

export const updateExistingOrganization = async (updateBody: {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) => {
  await getOrganizationById({ id: updateBody.id });

  const existingOrganization = await organizationModel.getOrganizationByName({
    name: updateBody.name,
  });

  if (existingOrganization && existingOrganization.id !== updateBody.id) {
    throw new CustomError(400, "Organization with this name already exists");
  }

  const organization = await organizationModel.updateOrganization(updateBody);

  return organizationSchema.parse(organization);
};

export const deleteExistingOrganization = async ({ id }: { id: number }) => {
  await getOrganizationById({ id });
  await organizationModel.deleteOrganization({ id });
};
