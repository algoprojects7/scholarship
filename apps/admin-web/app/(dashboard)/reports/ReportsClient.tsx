"use client";

import { ApplicationStatus, CURRENT_ACADEMIC_YEAR } from "@scholarship/shared";
import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  exportReport,
  type ReportFilters,
  type ReportFormat,
  type ReportType,
} from "@/lib/reports";

const STATUS_FILTER_OPTIONS: Array<{
  value: "" | ApplicationStatus;
  label: string;
}> = [
  { value: "", label: "All" },
  { value: ApplicationStatus.SUBMITTED, label: "Submitted" },
  { value: ApplicationStatus.UNDER_REVIEW, label: "Under Review" },
  { value: ApplicationStatus.APPROVED, label: "Approved" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.ALLOCATED, label: "Allocated" },
];

const REPORT_TYPES: Array<{
  type: ReportType;
  name: string;
  description: string;
}> = [
  {
    type: "applications",
    name: "Applications Summary",
    description: "Filterable export of all applications",
  },
  {
    type: "allocations",
    name: "Allocation Report",
    description: "Scholarship allocations and disbursements",
  },
  {
    type: "district",
    name: "District-wise Summary",
    description: "Applications grouped by district",
  },
  {
    type: "status",
    name: "Status-wise Summary",
    description: "Counts by application status",
  },
];

function buildAcademicYearOptions(): string[] {
  const startYear = Number.parseInt(
    CURRENT_ACADEMIC_YEAR.split("-")[0] ?? "2025",
    10,
  );
  const years: string[] = [];

  for (let offset = -2; offset <= 1; offset += 1) {
    const year = startYear + offset;
    years.push(`${year}-${String((year + 1) % 100).padStart(2, "0")}`);
  }

  return years;
}

function exportKey(type: ReportType, format: ReportFormat): string {
  return `${type}:${format}`;
}

export function ReportsClient() {
  const academicYearOptions = useMemo(() => buildAcademicYearOptions(), []);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ApplicationStatus>("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");

  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filters: ReportFilters = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: statusFilter || undefined,
    district: districtFilter.trim() || undefined,
    academicYear: academicYearFilter || undefined,
  };

  const handleExport = async (type: ReportType, format: ReportFormat) => {
    const key = exportKey(type, format);
    setExportingKey(key);
    setError(null);

    try {
      await exportReport({ type, format, filters });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to export report. Please try again.");
      }
    } finally {
      setExportingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="admin-card p-4">
        <p className="admin-kpi-label mb-3">Filters</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="date-from"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Date From
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="date-to"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Date To
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              min={dateFrom || undefined}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "" | ApplicationStatus)
              }
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="district-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              District
            </label>
            <input
              id="district-filter"
              type="text"
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              placeholder="Filter by district"
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="academic-year-filter"
              className="mb-1.5 block text-2xs font-medium uppercase tracking-wide text-admin-muted"
            >
              Academic Year
            </label>
            <select
              id="academic-year-filter"
              value={academicYearFilter}
              onChange={(event) => setAcademicYearFilter(event.target.value)}
              className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
            >
              <option value="">All</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <p className="font-medium">Export failed</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map((report) => {
          const pdfLoading = exportingKey === exportKey(report.type, "pdf");
          const xlsxLoading = exportingKey === exportKey(report.type, "xlsx");
          const isBusy = pdfLoading || xlsxLoading;

          return (
            <div key={report.type} className="admin-card p-4">
              <h3 className="text-xs font-semibold text-admin-primary">
                {report.name}
              </h3>
              <p className="mt-1 text-2xs text-admin-muted">
                {report.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleExport(report.type, "pdf")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-2xs font-medium text-admin-primary transition-colors hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pdfLoading ? (
                    <span
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-admin-border border-t-admin-accent"
                      aria-hidden
                    />
                  ) : null}
                  {pdfLoading ? "Exporting…" : "Export PDF"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleExport(report.type, "xlsx")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-admin-accent/30 bg-admin-accent/5 px-2.5 py-1.5 text-2xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {xlsxLoading ? (
                    <span
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-admin-accent/30 border-t-admin-accent"
                      aria-hidden
                    />
                  ) : null}
                  {xlsxLoading ? "Exporting…" : "Export Excel"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
