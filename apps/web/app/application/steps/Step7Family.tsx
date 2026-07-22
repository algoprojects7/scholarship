"use client";

import { Gender } from "@scholarship/shared";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

export function Step7Family() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyDetails.members",
  });

  return (
    <div className="space-y-8">
      <div>
        <StepHeading
          title="Family Details"
          description="Add individual family members and state monthly household finances."
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">
              Family Members
            </h3>
            <button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  gender: Gender.MALE,
                  relation: "",
                  qualification: "",
                  occupation: "",
                })
              }
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              + Add Member
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Member #{index + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-foreground)]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    {...register(`familyDetails.members.${index}.name`)}
                  />
                  <FieldError
                    message={errors.familyDetails?.members?.[index]?.name?.message}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-foreground)]">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field"
                    {...register(`familyDetails.members.${index}.gender`)}
                  >
                    <option value={Gender.MALE}>Male</option>
                    <option value={Gender.FEMALE}>Female</option>
                    <option value={Gender.OTHER}>Other</option>
                  </select>
                  <FieldError
                    message={errors.familyDetails?.members?.[index]?.gender?.message}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-foreground)]">
                    Relation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Father, Mother, Sister"
                    className="input-field"
                    {...register(`familyDetails.members.${index}.relation`)}
                  />
                  <FieldError
                    message={errors.familyDetails?.members?.[index]?.relation?.message}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-foreground)]">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graduate, Higher Secondary"
                    className="input-field"
                    {...register(`familyDetails.members.${index}.qualification`)}
                  />
                  <FieldError
                    message={
                      errors.familyDetails?.members?.[index]?.qualification?.message
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--color-foreground)]">
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Farmer, Business, Homemaker"
                    className="input-field"
                    {...register(`familyDetails.members.${index}.occupation`)}
                  />
                  <FieldError
                    message={errors.familyDetails?.members?.[index]?.occupation?.message}
                  />
                </div>
              </div>
            </div>
          ))}

          <FieldError message={errors.familyDetails?.members?.root?.message} />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-6">
        <StepHeading
          title="Family Financial Status"
          description="Monthly family income and expense in INR (₹)."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="familyDetails.familyMonthlyIncome"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Family Monthly Income (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="familyDetails.familyMonthlyIncome"
              type="number"
              min={0}
              placeholder="e.g. 25000"
              className="input-field"
              aria-invalid={errors.familyDetails?.familyMonthlyIncome ? true : undefined}
              {...register("familyDetails.familyMonthlyIncome")}
            />
            <FieldError message={errors.familyDetails?.familyMonthlyIncome?.message} />
          </div>

          <div>
            <label
              htmlFor="familyDetails.familyMonthlyExpense"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Family Monthly Expense (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="familyDetails.familyMonthlyExpense"
              type="number"
              min={0}
              placeholder="e.g. 15000"
              className="input-field"
              aria-invalid={errors.familyDetails?.familyMonthlyExpense ? true : undefined}
              {...register("familyDetails.familyMonthlyExpense")}
            />
            <FieldError message={errors.familyDetails?.familyMonthlyExpense?.message} />
          </div>
        </div>
      </div>
    </div>
  );
}
