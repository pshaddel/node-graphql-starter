export const typeDefs = `

type User {
	id: ID!
	name: String!
	email: String!
	displayName: String!
	avatar: String
	role: Role!
	posts: [Post]
	comments: [Comment]
	createdAt: String!
	updatedAt: String!
}

input UserCreateInput {
	name: String!
	email: String!
	displayName: String!
	avatar: String
	role: Role!
}

enum Role {
	ADMIN
	USER
}

type Post {
	id: ID!
	title: String!
	content: String!
	userId: ID!
	comments: [Comment]
	user: User!
}

type Comment {
	id: ID!
	content: String!
	postId: ID!
	userId: ID!
	user: User!
	post: Post
	replyTo: Comment
}

type Query {
	users(size: Int = 10, page: Int = 1): [User]
	posts: [Post]
	comments: [Comment]
	user(id: ID!): User
	post(id: ID!): Post
}

type Mutation {
	createUser(user: UserCreateInput!): User
}
`

export type User = {
	id: number;
	name: string;
	email: string;
	displayName: string;
	avatar?: string;
	role: Role;
	posts?: Post[];
	comments?: Comment[];
	createdAt: string;
	updatedAt: string;
}

export type Post = {
	id: number;
	title: string;
	content: string;
	userId: number;
	comments: Comment[];
	user: User;
}

export type Comment = {
	id: number;
	content: string;
	postId: number;
	userId: number;
	user: User;
	post: Post;
	replyTo: Comment;
}

export type UserCreateInput = {
	name: string;
	email: string;
	displayName: string;
	avatar?: string;
	role: Role;
}

export type Role = "ADMIN" | "USER";