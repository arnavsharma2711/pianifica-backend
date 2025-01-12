import { CustomError } from "../lib/error/custom.error";
import { type FilterOptions, getDefaultFilter } from "../lib/filters";
import type { Organization } from "../lib/schema/interface";
import { organizationSchema } from "../lib/schema/organization.schema";
import * as organizationModel from "../models/organization-model";

export const createNewOrganization = async ({
	name,
	description,
	address,
	phone,
	email,
	website,
}: Organization): Promise<Organization> => {
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

	return organization;
};

export const getOrganizationById = async ({
	id,
}: { id: number }): Promise<Organization> => {
	const organization = await organizationModel.getOrganizationById({ id });

	if (!organization) {
		throw new CustomError(404, "Organization not found");
	}

	return organization;
};

export const getOrganizationByName = async ({
	name,
}: { name: string }): Promise<Organization> => {
	const organization = await organizationModel.getOrganizationByName({ name });

	if (!organization) {
		throw new CustomError(404, "Organization not found");
	}

	return organization;
};

export const getAllOrganizations = async ({
	filters,
}: { filters: FilterOptions }): Promise<{
	organizationsData: Organization[];
	total_count: number;
}> => {
	const { organizations, total_count } =
		await organizationModel.getAllOrganizations({
			filters: getDefaultFilter(filters),
		});

	const organizationsData = organizations.map((organization) =>
		organizationSchema.parse(organization),
	);

	return { organizationsData, total_count };
};

export const updateExistingOrganization = async ({
	id,
	name,
	description,
	address,
	phone,
	email,
	website,
}: { id: number } & Omit<Organization, "id">): Promise<Organization> => {
	await getOrganizationById({ id });

	const existingOrganization = await organizationModel.getOrganizationByName({
		name,
	});

	if (existingOrganization && existingOrganization.id !== id) {
		throw new CustomError(400, "Organization with this name already exists");
	}

	const organization = await organizationModel.updateOrganization({
		id,
		name,
		description,
		address,
		phone,
		email,
		website,
	});

	return organization;
};

export const deleteExistingOrganization = async ({ id }: { id: number }) => {
	await getOrganizationById({ id });
	await organizationModel.deleteOrganization({ id });
};
