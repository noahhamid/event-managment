import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  username: string
  profilePicture?: string
  emailVerified: boolean
  verificationCode?: string
  verificationCodeExpiry?: Date
  lastUsernameChange?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  _id?: ObjectId
  title: string
  description: string
  imageUrl: string
  date: Date
  category: "academic" | "social" | "sports" | "cultural" | "other"
  createdBy: string
  likes: string[]
  dislikes: string[]
  comments: Comment[]
  reactions: Reaction[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: ObjectId
  userId: string
  username: string
  content: string
  createdAt: Date
}

export interface Reaction {
  userId: string
  emoji: string
}

export interface Session {
  _id?: ObjectId
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}
