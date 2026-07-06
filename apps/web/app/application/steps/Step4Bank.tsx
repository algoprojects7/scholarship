"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../schemas";
import { FieldError, StepHeading } from "../components/FormHelpers";

export function Step4Bank() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  const fields = [
    { name: "accountHolder" as const, label: "Account Holder Name" },
    { name: "accountNumber" as const, label: "Account Number" },
    { name: "bankName" as const, label: "Bank Name" },
    { name: "branchName" as const, label: "Branch Name" },
    { name: "ifscCode" as const, label: "IFSC Code" },
  ];

  return (
    <div>
      <StepHeading
        title="Bank Details"
        description="Enter the bank account where scholarship funds should be credited."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ name, label }) => (
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
              className="input-field uppercase"
              aria-invalid={errors.bankDetails?.[name] ? true : undefined}
              {...register(`bankDetails.${name}`, {
                setValueAs: (value: string) =>
                  name === "ifscCode" ? value.toUpperCase() : value,
              })}
            />
            <FieldError message={errors.bankDetails?.[name]?.message} />
          </div>
        ))}
      </div>
    </div>
  );
}
