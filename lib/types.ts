export interface User {
  _id?: string
  email: string
  username: string
  profilePicture?: string
  lastUsernameChange?: Date
  isVerified: boolean
  verificationCode?: string
  verificationExpires?: Date
  passwordResetCode?: string
  passwordResetExpires?: Date
  createdAt: Date
  likedPosts: string[]
  dislikedPosts: string[]
}

export interface Event {
  _id?: string
  title: string
  description: string
  imageUrl: string
  createdBy: string
  createdAt: Date
  likes: string[]
  dislikes: string[]
  comments: Comment[]
  reactions: Reaction[]
  category?: string
  date?: Date
  location?: string
}

export interface Comment {
  _id: string
  userId: string
  username: string
  text: string
  createdAt: Date
}

export interface Reaction {
  userId: string
  emoji: string
}
