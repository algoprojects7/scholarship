"use client";

import { PaymentType } from "@scholarship/shared";
import { useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.YEARLY, label: "Yearly" },
  { value: PaymentType.SEMESTER, label: "Semester" },
  { value: PaymentType.ONE_TIME, label: "One Time" },
];

export function Step5Fee() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Fee Details"
        description="Select how your institution fee is structured."
      />
      <div className="max-w-md">
        <label
          htmlFor="feeDetails.paymentType"
          className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Payment Type <span className="text-red-500">*</span>
        </label>
        <select
          id="feeDetails.paymentType"
          className="input-field"
          aria-invalid={errors.feeDetails?.paymentType ? true : undefined}
          {...register("feeDetails.paymentType")}
        >
          <option value="" disabled>
            Select payment type
          </option>
          {PAYMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.feeDetails?.paymentType?.message} />
      </div>
    </div>
  );
}
