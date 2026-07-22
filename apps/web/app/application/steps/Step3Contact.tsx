"use client";

import { INDIAN_STATES } from "@scholarship/shared";
import { PhoneInput } from "@scholarship/ui";
import { Controller, useFormContext } from "react-hook-form";
import { FieldError, StepHeading } from "../components/FormHelpers";
import type { ApplicationFormValues } from "../schemas";

export function Step3Contact() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div className="space-y-8">
      {/* Student Section */}
      <div>
        <StepHeading
          title="Student Contact"
          description="Direct contact details for the student."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contactAddress.student.mobile"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Student Mobile Number <span className="text-red-500">*</span>
            </label>
            <Controller
              name="contactAddress.student.mobile"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="contactAddress.student.mobile"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.contactAddress?.student?.mobile?.message}
                />
              )}
            />
            <input type="hidden" {...register("contactAddress.student.countryCode")} />
          </div>

          <div>
            <label
              htmlFor="contactAddress.student.email"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Student Email Id <span className="text-red-500">*</span>
            </label>
            <input
              id="contactAddress.student.email"
              type="email"
              className="input-field"
              aria-invalid={errors.contactAddress?.student?.email ? true : undefined}
              {...register("contactAddress.student.email")}
            />
            <FieldError message={errors.contactAddress?.student?.email?.message} />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contactAddress.student.whatsapp"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              WhatsApp Number <span className="text-xs text-[var(--color-muted-foreground)]">(Optional)</span>
            </label>
            <Controller
              name="contactAddress.student.whatsapp"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="contactAddress.student.whatsapp"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.contactAddress?.student?.whatsapp?.message}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Guardian Section */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <StepHeading
          title="Guardian Contact"
          description="Contact information for parent or legal guardian."
        />
        <div className="max-w-md">
          <label
            htmlFor="contactAddress.guardian.mobile"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Guardian Mobile Number <span className="text-red-500">*</span>
          </label>
          <Controller
            name="contactAddress.guardian.mobile"
            control={control}
            render={({ field }) => (
              <PhoneInput
                id="contactAddress.guardian.mobile"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.contactAddress?.guardian?.mobile?.message}
              />
            )}
          />
          <input type="hidden" {...register("contactAddress.guardian.countryCode")} />
        </div>
      </div>

      {/* Address Section */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <StepHeading
          title="Permanent Address"
          description="Residential address details."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contactAddress.address.villageTown"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Village / Town <span className="text-red-500">*</span>
            </label>
            <input
              id="contactAddress.address.villageTown"
              type="text"
              className="input-field"
              aria-invalid={errors.contactAddress?.address?.villageTown ? true : undefined}
              {...register("contactAddress.address.villageTown")}
            />
            <FieldError message={errors.contactAddress?.address?.villageTown?.message} />
          </div>

          <div>
            <label
              htmlFor="contactAddress.address.po"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              P.O. <span className="text-red-500">*</span>
            </label>
            <input
              id="contactAddress.address.po"
              type="text"
              className="input-field"
              aria-invalid={errors.contactAddress?.address?.po ? true : undefined}
              {...register("contactAddress.address.po")}
            />
            <FieldError message={errors.contactAddress?.address?.po?.message} />
          </div>

          <div>
            <label
              htmlFor="contactAddress.address.district"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              District <span className="text-red-500">*</span>
            </label>
            <input
              id="contactAddress.address.district"
              type="text"
              className="input-field"
              aria-invalid={errors.contactAddress?.address?.district ? true : undefined}
              {...register("contactAddress.address.district")}
            />
            <FieldError message={errors.contactAddress?.address?.district?.message} />
          </div>

          <div>
            <label
              htmlFor="contactAddress.address.pin"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              id="contactAddress.address.pin"
              type="text"
              maxLength={6}
              className="input-field"
              aria-invalid={errors.contactAddress?.address?.pin ? true : undefined}
              {...register("contactAddress.address.pin")}
            />
            <FieldError message={errors.contactAddress?.address?.pin?.message} />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contactAddress.address.state"
              className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
            >
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="contactAddress.address.state"
              className="input-field"
              aria-invalid={errors.contactAddress?.address?.state ? true : undefined}
              {...register("contactAddress.address.state")}
            >
              <option value="" disabled>Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.contactAddress?.address?.state?.message} />
          </div>
        </div>
      </div>
    </div>
  );
}
