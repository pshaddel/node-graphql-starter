import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import z from "zod";
// import type { UserCreateInput } from "../graphql-types";
const prisma = new PrismaClient();
export async function createUser(user: UserCreationObject): Promise<User> {
	const insertResult = await prisma.user.create({
		data: user,
	});
	prisma.$disconnect();
	return insertResult;
};

export const userCreationValidator = z.object({
	name: z.string(),
	email: z.string().email(),
	displayName: z.string(),
	avatar: z.string().optional().nullable(),
	role: z.enum(["USER", "ADMIN", "SUPPORT_USER"]).default("USER"),
});

export async function getUsers(page: number, size: number): Promise<User[]> {
	const users = await prisma.user.findMany({
		skip: (page - 1) * size,
		take: size,
	});
	prisma.$disconnect();
	return users;
}

export async function getUserById(id: number): Promise<User | null> {
	const user = await prisma.user.findUnique({
		where: { id: id.toString() },
	});
	prisma.$disconnect();
	return user;
}

type UserCreationObject = z.infer<typeof userCreationValidator>;

export const userResolver = {
	createUser,
	getUsers,
	getUserById,
	userCreationValidator,
}