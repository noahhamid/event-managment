"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  User,
  Lock,
  Trash2,
  Camera,
  Upload,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userData, error: userError } = useSWR("/api/auth/me", fetcher);

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (userError) {
      router.push("/signin");
    }
    if (userData?.user) {
      setUsername(userData.user.username);
      setProfilePicture(userData.user.profilePicture || "");
    }
  }, [userError, userData, router]);

  const user = userData?.user;

  const canChangeUsername = () => {
    if (!user?.lastUsernameChange) return true;
    const lastChange = new Date(user.lastUsernameChange);
    const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
    return lastChange < threeWeeksAgo;
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeUsername()) {
      setError("You can only change your username once every 3 weeks");
      return;
    }

    setLoading("username");
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Username updated successfully");
      mutate("/api/auth/me");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update username"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("password");
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("picture");
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Update profile picture with uploaded URL
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture: uploadData.url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfilePicture(uploadData.url);
      setSuccess("Profile picture updated successfully");
      mutate("/api/auth/me");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to upload profile picture"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateProfilePicture = async () => {
    setLoading("picture");
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Profile picture updated successfully");
      mutate("/api/auth/me");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile picture"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }

    setLoading("delete");
    setDeleteError("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account");
        return;
      }

      router.push("/");
    } catch (err) {
      setDeleteError("Failed to delete account");
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Profile Picture - Added file upload option */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>Upload an image or enter a URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading === "picture"}
                >
                  {loading === "picture" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Or enter image URL
                </Label>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
                <Button
                  onClick={handleUpdateProfilePicture}
                  disabled={loading === "picture"}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  {loading === "picture" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update from URL"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Username */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username
            </CardTitle>
            <CardDescription>
              {canChangeUsername()
                ? "You can change your username"
                : `You can change your username again on ${new Date(new Date(user.lastUsernameChange).getTime() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!canChangeUsername()}
                />
              </div>
              <Button
                type="submit"
                disabled={loading === "username" || !canChangeUsername()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {loading === "username" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Username"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading === "password"}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {loading === "password" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account - Added password confirmation */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                    Please enter your password to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="delete-password">Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                  />
                  {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading === "delete"}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {loading === "delete" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
