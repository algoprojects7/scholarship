"use client";

import { AdminType } from "@scholarship/shared";
import { PasswordInput, ShowPasswordCheckbox } from "@scholarship/ui";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  createAdmin,
  listAdmins,
  updateAdmin,
  type AdminListItem,
} from "@/lib/admins";
import { getMe } from "@/lib/auth";

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function AdminsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.6fr)] gap-4 border-b border-admin-border px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <span
              key={cellIndex}
              className="h-3 animate-pulse rounded bg-admin-border"
            />
          ))}
        </div>
      ))}
    </>
  );
}

function AccessDenied() {
  return (
    <div className="admin-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-admin-primary">Access denied</p>
      <p className="mt-1 text-xs text-admin-muted">
        Only Super Admins can manage operators. Contact your administrator if you
        need access.
      </p>
    </div>
  );
}

function CreateOperatorModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (admin: AdminListItem) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("Test@123");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmployeeId("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setPassword("Test@123");
    setShowPassword(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const admin = await createAdmin({
        fullName: fullName.trim(),
        employeeId: employeeId.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        password,
        adminType: AdminType.OPERATOR,
        countryCode: "+91",
      });
      onCreated(admin);
      handleClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create operator. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-admin-primary/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-operator-title"
    >
      <div className="admin-card w-full max-w-md">
        <div className="border-b border-admin-border px-4 py-3">
          <h3
            id="create-operator-title"
            className="text-sm font-semibold text-admin-primary"
          >
            Create Operator
          </h3>
          <p className="mt-0.5 text-2xs text-admin-muted">
            New operator receives the temporary password below
          </p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3 p-4">
          <div>
            <label
              htmlFor="operator-full-name"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Full Name
            </label>
            <input
              id="operator-full-name"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="operator-employee-id"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Employee ID
            </label>
            <input
              id="operator-employee-id"
              type="text"
              required
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="operator-email"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Email
            </label>
            <input
              id="operator-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="operator-phone"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Phone
            </label>
            <div className="flex overflow-hidden rounded-md border border-admin-border bg-admin-bg focus-within:ring-2 focus-within:ring-admin-accent/30">
              <span className="inline-flex shrink-0 items-center border-r border-admin-border bg-admin-bg px-3 text-xs font-medium text-admin-muted">
                +91
              </span>
              <input
                id="operator-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
                className="min-w-0 flex-1 bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="operator-department"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Department
            </label>
            <input
              id="operator-department"
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="operator-password"
              className="mb-1 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Temporary Password
            </label>
            <PasswordInput
              id="operator-password"
              variant="admin"
              visible={showPassword}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
            <p className="mt-1 text-[10px] text-admin-muted">
              Min 8 characters, one uppercase letter and one number
            </p>
          </div>

          {error ? (
            <p className="text-2xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <ShowPasswordCheckbox
            checked={showPassword}
            onChange={setShowPassword}
            variant="admin"
            disabled={submitting}
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-xs font-medium text-admin-primary hover:bg-admin-bg disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-hover disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Operator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminRow({
  admin,
  onToggleActive,
  busy,
}: {
  admin: AdminListItem;
  onToggleActive: (admin: AdminListItem, nextActive: boolean) => Promise<void>;
  busy: boolean;
}) {
  const isSuper = admin.adminType === AdminType.SUPER;
  const phoneDisplay = admin.phone
    ? `${admin.countryCode ?? "+91"} ${admin.phone}`
    : "—";

  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.6fr)] items-center gap-4 border-b border-admin-border px-4 py-3 text-xs last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium text-admin-primary">{admin.fullName}</p>
        {isSuper ? (
          <span className="mt-0.5 inline-flex rounded bg-admin-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-admin-primary">
            Super
          </span>
        ) : null}
      </div>
      <span className="truncate text-admin-muted">{admin.employeeId}</span>
      <span className="truncate text-admin-muted">{admin.user?.email ?? "—"}</span>
      <span className="truncate text-admin-muted">{phoneDisplay}</span>
      <span className="truncate text-admin-muted">{admin.department ?? "—"}</span>
      <span className="text-admin-muted">{formatDateTime(admin.lastLoginAt)}</span>
      <div>
        {isSuper ? (
          <span className="text-2xs text-admin-muted">—</span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onToggleActive(admin, !admin.isActive)}
            className={`rounded-md border px-2 py-1 text-2xs font-medium transition-colors disabled:opacity-60 ${
              admin.isActive
                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {busy ? "…" : admin.isActive ? "Disable" : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminsClient() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyAdminId, setBusyAdminId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listAdmins();
      setAdmins(response.items ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("access_denied");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load admins. Please try again.",
        );
      }
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getMe()
      .then((response) => {
        setIsSuperAdmin(response.user.adminType === AdminType.SUPER);
      })
      .catch(() => {
        setIsSuperAdmin(false);
      });
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      void loadAdmins();
    } else if (isSuperAdmin === false) {
      setLoading(false);
    }
  }, [isSuperAdmin, loadAdmins]);

  const handleToggleActive = async (
    admin: AdminListItem,
    nextActive: boolean,
  ) => {
    setBusyAdminId(admin.id);

    try {
      const updated = await updateAdmin(admin.id, { isActive: nextActive });
      setAdmins((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to update operator status.",
      );
    } finally {
      setBusyAdminId(null);
    }
  };

  if (isSuperAdmin === null || (isSuperAdmin && loading)) {
    return (
      <div className="admin-card overflow-hidden">
        <AdminsTableSkeleton />
      </div>
    );
  }

  if (!isSuperAdmin || error === "access_denied") {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-admin-muted">
          {admins.length} admin account{admins.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-hover"
        >
          Create Operator
        </button>
      </div>

      {error && error !== "access_denied" ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => void loadAdmins()}
            className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1.5 text-2xs font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.6fr)] gap-4 border-b border-admin-border bg-admin-bg/50 px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-admin-muted">
          <span>Name</span>
          <span>Employee ID</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Department</span>
          <span>Last Login</span>
          <span>Actions</span>
        </div>

        {admins.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-admin-primary">No admins found</p>
            <p className="mt-1 text-xs text-admin-muted">
              Create an operator account to delegate application review.
            </p>
          </div>
        ) : (
          admins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              onToggleActive={handleToggleActive}
              busy={busyAdminId === admin.id}
            />
          ))
        )}
      </div>

      <CreateOperatorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(admin) => setAdmins((current) => [...current, admin])}
      />
    </div>
  );
}
