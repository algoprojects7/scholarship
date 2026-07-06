"use client";

import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../schemas";
import { FEE_YEARS } from "../schemas";
import { FieldError, StepHeading } from "../components/FormHelpers";

export function Step6YearWiseFees() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Year-wise Fees"
        description="Enter the amount paid for each academic year (2022–2026). Use 0 if not applicable."
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--color-foreground)]">
                Year
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--color-foreground)]">
                Amount Paid (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {FEE_YEARS.map((year, index) => (
              <tr key={year}>
                <td className="px-4 py-3 font-medium">{year}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-field max-w-xs"
                    aria-invalid={
                      errors.feePayments?.[index]?.amountPaid ? true : undefined
                    }
                    {...register(`feePayments.${index}.amountPaid`, {
                      valueAsNumber: true,
                    })}
                  />
                  <input
                    type="hidden"
                    {...register(`feePayments.${index}.year`, {
                      valueAsNumber: true,
                    })}
                  />
                  <FieldError
                    message={errors.feePayments?.[index]?.amountPaid?.message}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {errors.feePayments?.message ? (
        <FieldError message={errors.feePayments.message as string} />
      ) : null}
    </div>
  );
}
