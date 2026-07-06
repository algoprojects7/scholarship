"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../schemas";
import { READING_YEAR_OPTIONS } from "../schemas";
import { FieldError, StepHeading } from "../components/FormHelpers";

export function Step2Educational() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Educational Details"
        description="Provide your current course and institution information."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="educationalDetails.readingYear"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Reading Year <span className="text-red-500">*</span>
          </label>
          <select
            id="educationalDetails.readingYear"
            className="input-field"
            aria-invalid={errors.educationalDetails?.readingYear ? true : undefined}
            {...register("educationalDetails.readingYear")}
          >
            <option value="" disabled>
              Select year
            </option>
            {READING_YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={errors.educationalDetails?.readingYear?.message} />
        </div>

        <div>
          <label
            htmlFor="educationalDetails.batch"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Batch <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.batch"
            type="text"
            placeholder="e.g. 2022-26"
            className="input-field"
            aria-invalid={errors.educationalDetails?.batch ? true : undefined}
            {...register("educationalDetails.batch")}
          />
          <FieldError message={errors.educationalDetails?.batch?.message} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="educationalDetails.institutionName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Institution Name <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.institutionName"
            type="text"
            className="input-field"
            aria-invalid={
              errors.educationalDetails?.institutionName ? true : undefined
            }
            {...register("educationalDetails.institutionName")}
          />
          <FieldError
            message={errors.educationalDetails?.institutionName?.message}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="educationalDetails.courseName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Course Name <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.courseName"
            type="text"
            className="input-field"
            aria-invalid={errors.educationalDetails?.courseName ? true : undefined}
            {...register("educationalDetails.courseName")}
          />
          <FieldError message={errors.educationalDetails?.courseName?.message} />
        </div>
      </div>
    </div>
  );
}
