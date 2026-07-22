"use client";

import { Caste, Gender } from "@scholarship/shared";
import { useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

const CASTE_LABELS: Record<Caste, string> = {
  [Caste.GEN]: "Gen",
  [Caste.SC]: "SC",
  [Caste.ST_P]: "ST (P)",
  [Caste.ST_H]: "ST (H)",
  [Caste.OBC]: "OBC",
  [Caste.MOBC]: "MOBC",
};

export function Step1Personal() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Personal Details"
        description="Provide your personal profile, family details, and caste information."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="personalDetails.studentName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Student Name <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.studentName"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.studentName ? true : undefined}
            {...register("personalDetails.studentName")}
          />
          <FieldError message={errors.personalDetails?.studentName?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.gender"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="personalDetails.gender"
            className="input-field"
            aria-invalid={errors.personalDetails?.gender ? true : undefined}
            {...register("personalDetails.gender")}
          >
            <option value="" disabled>Select Gender</option>
            {Object.values(Gender).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <FieldError message={errors.personalDetails?.gender?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.fatherName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Father's Name <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.fatherName"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.fatherName ? true : undefined}
            {...register("personalDetails.fatherName")}
          />
          <FieldError message={errors.personalDetails?.fatherName?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.fatherProfession"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Father's Profession <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.fatherProfession"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.fatherProfession ? true : undefined}
            {...register("personalDetails.fatherProfession")}
          />
          <FieldError message={errors.personalDetails?.fatherProfession?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.motherName"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Mother's Name <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.motherName"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.motherName ? true : undefined}
            {...register("personalDetails.motherName")}
          />
          <FieldError message={errors.personalDetails?.motherName?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.motherProfession"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Mother's Profession <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.motherProfession"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.motherProfession ? true : undefined}
            {...register("personalDetails.motherProfession")}
          />
          <FieldError message={errors.personalDetails?.motherProfession?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.religion"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Religion <span className="text-red-500">*</span>
          </label>
          <input
            id="personalDetails.religion"
            type="text"
            className="input-field"
            aria-invalid={errors.personalDetails?.religion ? true : undefined}
            {...register("personalDetails.religion")}
          />
          <FieldError message={errors.personalDetails?.religion?.message} />
        </div>

        <div>
          <label
            htmlFor="personalDetails.caste"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Caste <span className="text-red-500">*</span>
          </label>
          <select
            id="personalDetails.caste"
            className="input-field"
            aria-invalid={errors.personalDetails?.caste ? true : undefined}
            {...register("personalDetails.caste")}
          >
            <option value="" disabled>Select Caste</option>
            {Object.values(Caste).map((c) => (
              <option key={c} value={c}>
                {CASTE_LABELS[c]}
              </option>
            ))}
          </select>
          <FieldError message={errors.personalDetails?.caste?.message} />
        </div>
      </div>
    </div>
  );
}
