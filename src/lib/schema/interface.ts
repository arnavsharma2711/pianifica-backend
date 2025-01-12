interface Organization {
	id?: number;
	name: string;
	description?: string | null;
	address?: string | null;
	phone?: string | null;
	email?: string | null;
	website?: string | null;
	status?: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
}

interface User {
	id: number;
	organizationId: number;
	firstName: string;
	lastName?: string;
	username: string;
	email: string;
	password: string;
	profilePictureUrl?: string;
	phone?: string;
	designation?: string;
	verifiedAt?: Date;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

interface UserToken {
	id: number;
	userId: number;
	token: string;
	type: "RESET_PASSWORD" | "VERIFY_EMAIL";
	expiresAt: Date;
	createdAt: Date;
}

interface UserRole {
	userId: number;
	role: "SUPER_ADMIN" | "ORG_ADMIN" | "ORG_MEMBER";
	createdAt: Date;
}

export type { Organization, User, UserToken, UserRole };
