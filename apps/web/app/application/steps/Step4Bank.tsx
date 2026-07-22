"use client";

import { useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

export function Step4Bank() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  const fields = [
    { name: "accountHolder" as const, label: "Account Holder Name", isUppercase: true },
    { name: "accountNumber" as const, label: "Account Number", isUppercase: false },
    { name: "bankName" as const, label: "Bank Name", isUppercase: false },
    { name: "branchName" as const, label: "Branch Name", isUppercase: false },
    { name: "ifscCode" as const, label: "IFSC Code", isUppercase: true },
  ];

  return (
    <div>
      <StepHeading
        title="Bank Details"
        description="Enter the bank account where scholarship funds should be credited."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ name, label, isUppercase }) => (
          <div
            key={name}
            className={name === "ifscCode" ? "sm:col-span-2 sm:max-w-md" : ""}
          >
            <label
              htmlFor={`bankDetails.${name}`}
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              id={`bankDetails.${name}`}
              type="text"
              className={`input-field ${isUppercase ? "uppercase" : ""}`}
              aria-invalid={errors.bankDetails?.[name] ? true : undefined}
              {...register(`bankDetails.${name}`, {
                setValueAs: (value: string) =>
                  isUppercase && typeof value === "string" ? value.toUpperCase() : value,
              })}
            />
            <FieldError message={errors.bankDetails?.[name]?.message} />
          </div>
        ))}
      </div>
    </div>
  );
}
