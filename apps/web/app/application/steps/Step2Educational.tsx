"use client";

import { COURSE_OPTIONS, ResidenceType } from "@scholarship/shared";
import { useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import { DURATION_OPTIONS, type ApplicationFormValues } from "../schemas";

export function Step2Educational() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Educational Details"
        description="Enter details about your course, duration, roll number, institute, and accommodation."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="educationalDetails.courseName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Course Name <span className="text-red-500">*</span>
          </label>
          <select
            id="educationalDetails.courseName"
            className="input-field"
            aria-invalid={errors.educationalDetails?.courseName ? true : undefined}
            {...register("educationalDetails.courseName")}
          >
            <option value="" disabled>Select Course</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={errors.educationalDetails?.courseName?.message} />
        </div>

        <div>
          <label
            htmlFor="educationalDetails.duration"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Duration <span className="text-red-500">*</span>
          </label>
          <select
            id="educationalDetails.duration"
            className="input-field"
            aria-invalid={errors.educationalDetails?.duration ? true : undefined}
            {...register("educationalDetails.duration")}
          >
            <option value="" disabled>Select Duration</option>
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <FieldError message={errors.educationalDetails?.duration?.message} />
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
            placeholder="2026-27"
            className="input-field"
            aria-invalid={errors.educationalDetails?.batch ? true : undefined}
            {...register("educationalDetails.batch")}
          />
          <FieldError message={errors.educationalDetails?.batch?.message} />
        </div>

        <div>
          <label
            htmlFor="educationalDetails.rollNumber"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Roll Number <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.rollNumber"
            type="text"
            className="input-field"
            aria-invalid={errors.educationalDetails?.rollNumber ? true : undefined}
            {...register("educationalDetails.rollNumber")}
          />
          <FieldError message={errors.educationalDetails?.rollNumber?.message} />
        </div>

        <div>
          <label
            htmlFor="educationalDetails.currentSemester"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Current Semester <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.currentSemester"
            type="text"
            placeholder="e.g. 5th Semester"
            className="input-field"
            aria-invalid={errors.educationalDetails?.currentSemester ? true : undefined}
            {...register("educationalDetails.currentSemester")}
          />
          <FieldError message={errors.educationalDetails?.currentSemester?.message} />
        </div>

        <div>
          <label
            htmlFor="educationalDetails.dateOfCourseCompletion"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Date of Course Completion <span className="text-red-500">*</span>
          </label>
          <input
            id="educationalDetails.dateOfCourseCompletion"
            type="date"
            className="input-field"
            aria-invalid={errors.educationalDetails?.dateOfCourseCompletion ? true : undefined}
            {...register("educationalDetails.dateOfCourseCompletion")}
          />
          <FieldError message={errors.educationalDetails?.dateOfCourseCompletion?.message} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="educationalDetails.instituteNameWithAddress"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Institute Name with Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="educationalDetails.instituteNameWithAddress"
            rows={2}
            placeholder="Gauhati Medical College, Guwahati, Assam"
            className="input-field"
            aria-invalid={errors.educationalDetails?.instituteNameWithAddress ? true : undefined}
            {...register("educationalDetails.instituteNameWithAddress")}
          />
          <FieldError message={errors.educationalDetails?.instituteNameWithAddress?.message} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[var(--color-foreground)]">
            Accommodation Status <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--color-foreground)]">
              <input
                type="radio"
                value={ResidenceType.HOSTELER}
                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                {...register("educationalDetails.residenceType")}
              />
              Hosteler
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--color-foreground)]">
              <input
                type="radio"
                value={ResidenceType.DAY_SCHOLAR}
                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                {...register("educationalDetails.residenceType")}
              />
              Day Scholar
            </label>
          </div>
          <FieldError message={errors.educationalDetails?.residenceType?.message} />
        </div>
      </div>
    </div>
  );
}
