"use server"

import { getDatabase } from "@/lib/mongodb"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import {
  generateVerificationCode,
  setUserSession,
  clearUserSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth-utils"
import { ObjectId } from "mongodb"

export async function signUp(email: string, password: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser && existingUser.isVerified) {
      return { error: "User already exists with this email" }
    }

    const verificationCode = generateVerificationCode()
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const hashedPassword = await hashPassword(password)

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    // Store or update user with verification code
    if (existingUser) {
      await users.updateOne(
        { email },
        {
          $set: {
            verificationCode,
            verificationExpires,
            password: hashedPassword,
          },
        },
      )
    } else {
      await users.insertOne({
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        verificationExpires,
        createdAt: new Date(),
        likedPosts: [],
        dislikedPosts: [],
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Failed to sign up. Please try again." }
  }
}

export async function verifyEmailAndSetUsername(email: string, code: string, username: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    // Find user with matching email and code
    const user = await users.findOne({
      email,
      verificationCode: code,
      verificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return { error: "Invalid or expired verification code" }
    }

    // Check if username is already taken
    const existingUsername = await users.findOne({ username })
    if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
      return { error: "Username is already taken" }
    }

    // Update user
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          username,
          isVerified: true,
        },
        $unset: {
          verificationCode: "",
          verificationExpires: "",
        },
      },
    )

    // Set session
    await setUserSession(user._id.toString(), username)

    return { success: true }
  } catch (error) {
    console.error("Verification error:", error)
    return { error: "Failed to verify. Please try again." }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email, isVerified: true })

    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValidPassword = await verifyPassword(password, user.password as string)

    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    await setUserSession(user._id.toString(), user.username as string)

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in. Please try again." }
  }
}

export async function logout() {
  await clearUserSession()
  return { success: true }
}

export async function deleteUserProfile(email: string, password: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email, isVerified: true })

    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValidPassword = await verifyPassword(password, user.password as string)

    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    // Delete user profile
    await users.deleteOne({ _id: user._id })

    // Clear session
    await clearUserSession()

    return { success: true }
  } catch (error) {
    console.error("Delete profile error:", error)
    return { error: "Failed to delete profile. Please try again." }
  }
}

export async function updateProfilePicture(pictureData: string) {
  try {
    const { getUserSession } = await import("@/lib/auth-utils")
    const session = await getUserSession()

    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const users = db.collection("users")

    await users.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          profilePicture: pictureData,
        },
      },
    )

    return { success: true }
  } catch (error) {
    console.error("Update profile picture error:", error)
    return { error: "Failed to update profile picture" }
  }
}

export async function changeUsername(newUsername: string) {
  try {
    const { getUserSession } = await import("@/lib/auth-utils")
    const session = await getUserSession()

    if (!session) {
      return { error: "Not authenticated" }
    }

    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return { error: "User not found" }
    }

    // Check if username was changed in the last 7 days
    if (user.lastUsernameChange) {
      const lastChange = new Date(user.lastUsernameChange)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      if (lastChange > weekAgo) {
        const daysUntil = Math.ceil((lastChange.getTime() - weekAgo.getTime()) / (24 * 60 * 60 * 1000))
        return { error: `You can change your username again in ${daysUntil} days` }
      }
    }

    // Check if new username is already taken
    const existingUser = await users.findOne({
      username: newUsername,
      _id: { $ne: new ObjectId(session.userId) },
    })

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Update username
    await users.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          username: newUsername,
          lastUsernameChange: new Date(),
        },
      },
    )

    // Update session
    await setUserSession(session.userId, newUsername)

    return { success: true }
  } catch (error) {
    console.error("Change username error:", error)
    return { error: "Failed to change username" }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email, isVerified: true })

    if (!user) {
      // Don't reveal if email exists
      return { success: true }
    }

    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetCode: resetCode,
          passwordResetExpires: resetExpires,
        },
      },
    )

    await sendPasswordResetEmail(email, resetCode)

    return { success: true }
  } catch (error) {
    console.error("Request password reset error:", error)
    return { success: true }
  }
}

export async function resetPassword(email: string, resetCode: string, newPassword: string) {
  try {
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({
      email,
      passwordResetCode: resetCode,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!user) {
      return { error: "Invalid or expired reset code" }
    }

    const hashedPassword = await hashPassword(newPassword)

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          passwordResetCode: "",
          passwordResetExpires: "",
        },
      },
    )

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to reset password" }
  }
}
