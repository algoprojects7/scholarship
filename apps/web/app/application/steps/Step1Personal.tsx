"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../schemas";
import { FieldError, StepHeading } from "../components/FormHelpers";

export function Step1Personal() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  const fields = [
    { name: "studentName" as const, label: "Student Name" },
    { name: "fatherName" as const, label: "Father's Name" },
    { name: "fatherProfession" as const, label: "Father's Profession" },
    { name: "motherName" as const, label: "Mother's Name" },
    { name: "motherProfession" as const, label: "Mother's Profession" },
    { name: "religion" as const, label: "Religion" },
  ];

  return (
    <div>
      <StepHeading
        title="Personal Details"
        description="Tell us about yourself and your family."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ name, label }) => (
          <div key={name} className={name === "religion" ? "sm:col-span-2" : ""}>
            <label
              htmlFor={`personalDetails.${name}`}
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              id={`personalDetails.${name}`}
              type="text"
              className="input-field"
              aria-invalid={errors.personalDetails?.[name] ? true : undefined}
              {...register(`personalDetails.${name}`)}
            />
            <FieldError message={errors.personalDetails?.[name]?.message} />
          </div>
        ))}
      </div>
    </div>
  );
}
