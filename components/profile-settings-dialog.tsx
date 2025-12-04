"use client"

import type React from "react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Upload, KeyRound, Edit2 } from "lucide-react"
import { updateProfilePicture, changeUsername, requestPasswordReset, resetPassword } from "@/app/actions/auth"

interface ProfileSettingsDialogProps {
  user: any
}

export function ProfileSettingsDialog({ user }: ProfileSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"picture" | "username" | "password">("picture")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile picture upload
  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string
        const result = await updateProfilePicture(base64)

        if (result.success) {
          setMessage({ type: "success", text: "Profile picture updated successfully" })
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update picture" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error uploading picture" })
      }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // Change username
  const handleUsernameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newUsername = (e.currentTarget.elements.namedItem("newUsername") as HTMLInputElement).value

    if (!newUsername.trim()) {
      setMessage({ type: "error", text: "Username cannot be empty" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await changeUsername(newUsername)

      if (result.success) {
        setMessage({ type: "success", text: "Username updated successfully" })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to change username" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error changing username" })
    }
    setLoading(false)
  }

  // Password reset request
  const [resetStep, setResetStep] = useState<"request" | "verify">("request")
  const [resetEmail, setResetEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const handlePasswordResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await requestPasswordReset(resetEmail)

      if (result.success) {
        setMessage({ type: "success", text: "Reset code sent to your email" })
        setResetStep("verify")
      } else {
        setMessage({ type: "error", text: result.error || "Failed to send reset code" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error requesting password reset" })
    }
    setLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await resetPassword(resetEmail, resetCode, newPassword)

      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully" })
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage({ type: "error", text: result.error || "Failed to reset password" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error resetting password" })
    }
    setLoading(false)
  }

  const canChangeUsername =
    !user.lastUsernameChange || new Date(user.lastUsernameChange).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Processing...</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "picture" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("picture")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Picture
            </Button>
            <Button
              variant={activeTab === "username" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("username")}
              className="flex-1"
              disabled={!canChangeUsername}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Username
            </Button>
            <Button
              variant={activeTab === "password" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("password")}
              className="flex-1"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Password
            </Button>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Picture upload */}
          {activeTab === "picture" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
                disabled={loading}
                className="w-full cursor-pointer rounded-md border border-input px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          )}

          {/* Username change */}
          {activeTab === "username" && (
            <div className="space-y-3">
              {!canChangeUsername ? (
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  You can change your username once per week. Try again later.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Change your username (once per week)</p>
                  <form onSubmit={handleUsernameChange} className="space-y-2">
                    <input
                      type="text"
                      name="newUsername"
                      placeholder="New username"
                      defaultValue={user.username}
                      required
                      disabled={loading}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Updating..." : "Update Username"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Password reset */}
          {activeTab === "password" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Reset your password</p>

              {resetStep === "request" ? (
                <form onSubmit={handlePasswordResetRequest} className="space-y-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Reset code from email"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    required
                    disabled={loading}
                    maxLength={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setResetStep("request")
                      setResetCode("")
                      setNewPassword("")
                    }}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
