import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import { organizationSchema } from "../lib/schema/organization.schema";
import * as organizationModel from "../models/organization-model";

export const createNewOrganization = async ({
  name,
  description,
  address,
  phone,
  email,
  website,
}: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) => {
  const existingOrganization = await organizationModel.getOrganizationByName({
    name,
  });

  if (existingOrganization) {
    throw new CustomError(400, "Organization with this name already exists");
  }

  const organization = await organizationModel.createOrganization({
    name,
    description,
    address,
    phone,
    email,
    website,
  });

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
    organizationSchema.parse(organization)
  );

  return { organizationsData, total_count };
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
