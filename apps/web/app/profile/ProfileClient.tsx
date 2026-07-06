"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@scholarship/shared";
import { PasswordInput, ShowPasswordCheckbox } from "@scholarship/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ApiError, changePassword } from "@/lib/api";
import { logoutUser } from "@/lib/auth";
import {
  fetchProfileAvatarBlob,
  fetchStudentProfile,
  uploadProfileAvatar,
  type StudentProfile,
} from "@/lib/profile";

function ProfileInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--color-foreground)]">{value}</dd>
    </div>
  );
}

export function ProfileClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const loadAvatar = useCallback(async (hasAvatar: boolean) => {
    if (!hasAvatar) {
      setAvatarUrl(null);
      return;
    }

    try {
      const blob = await fetchProfileAvatarBlob();
      const objectUrl = URL.createObjectURL(blob);
      setAvatarUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return objectUrl;
      });
    } catch {
      setAvatarUrl(null);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchStudentProfile();
      setProfile(data);
      await loadAvatar(data.hasAvatar);
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Unable to load profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadAvatar]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setPhotoError(null);
    setPhotoMessage(null);
    setUploadingPhoto(true);

    try {
      const response = await uploadProfileAvatar(file);
      setPhotoMessage(response.message);
      if (profile) {
        setProfile({ ...profile, hasAvatar: true });
      }
      await loadAvatar(true);
    } catch (error) {
      setPhotoError(
        error instanceof ApiError
          ? error.message
          : "Unable to upload photo. Please try again.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  const onPasswordSubmit = handleSubmit(async (data) => {
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      const response = await changePassword(data);
      setPasswordMessage(response.message);
      reset();
      setShowPassword(false);
    } catch (error) {
      setPasswordError(
        error instanceof ApiError
          ? error.message
          : "Unable to change password. Please try again.",
      );
    }
  });

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logoutUser();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="card">
        <p className="text-sm text-red-600" role="alert">
          {loadError ?? "Profile not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-muted-foreground">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={`${profile.fullName} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.fullName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Profile Photo
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a JPEG or PNG photo (max 2 MB). Stored persistently on the
                server for production.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(event) => void handlePhotoChange(event)}
            />
            <button
              type="button"
              className="btn-secondary"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingPhoto ? "Uploading…" : "Change Photo"}
            </button>
          </div>
        </div>

        {photoMessage ? (
          <p className="mt-4 text-sm text-emerald-700" role="status">
            {photoMessage}
          </p>
        ) : null}
        {photoError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {photoError}
          </p>
        ) : null}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Personal Information
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ProfileInfoRow label="Full Name" value={profile.fullName} />
          <ProfileInfoRow label="Email" value={profile.email} />
          <ProfileInfoRow label="Gender" value={profile.gender} />
          <ProfileInfoRow
            label="Mobile"
            value={`${profile.countryCode} ${profile.mobile}`}
          />
        </dl>
      </div>

      <div className="card" id="change-password">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your account password. You will stay signed in after a
          successful change.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => void onPasswordSubmit(event)}
          noValidate
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Current Password
            </label>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  id="currentPassword"
                  variant="student"
                  visible={showPassword}
                  autoComplete="current-password"
                  aria-invalid={errors.currentPassword ? true : undefined}
                  {...field}
                />
              )}
            />
            {errors.currentPassword ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.currentPassword.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              New Password
            </label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  id="newPassword"
                  variant="student"
                  visible={showPassword}
                  autoComplete="new-password"
                  aria-invalid={errors.newPassword ? true : undefined}
                  {...field}
                />
              )}
            />
            {errors.newPassword ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Confirm New Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  id="confirmPassword"
                  variant="student"
                  visible={showPassword}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  {...field}
                />
              )}
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <ShowPasswordCheckbox
              checked={showPassword}
              onChange={setShowPassword}
              variant="student"
              disabled={isSubmitting}
            />

            {passwordMessage ? (
              <p className="text-sm text-emerald-700" role="status">
                {passwordMessage}
              </p>
            ) : null}
            {passwordError ? (
              <p className="text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out of your student account on this device.
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
        >
          {loggingOut ? "Signing out…" : "Logout"}
        </button>
      </div>
    </div>
  );
}
