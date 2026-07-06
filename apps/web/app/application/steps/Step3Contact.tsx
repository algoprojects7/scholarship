"use client";

import { INDIAN_STATES } from "@scholarship/shared";
import { PhoneInput } from "@scholarship/ui";
import { Controller, useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "../schemas";
import { FieldError, StepHeading } from "../components/FormHelpers";

export function Step3Contact() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <div>
      <StepHeading
        title="Contact & Address"
        description="Your mobile number and permanent address details."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="contactAddress.mobile"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <Controller
            name="contactAddress.mobile"
            control={control}
            render={({ field }) => (
              <PhoneInput
                id="contactAddress.mobile"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.contactAddress?.mobile?.message}
              />
            )}
          />
          <input type="hidden" {...register("contactAddress.countryCode")} />
        </div>

        <div>
          <label
            htmlFor="contactAddress.village"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Village <span className="text-red-500">*</span>
          </label>
          <input
            id="contactAddress.village"
            type="text"
            className="input-field"
            aria-invalid={errors.contactAddress?.village ? true : undefined}
            {...register("contactAddress.village")}
          />
          <FieldError message={errors.contactAddress?.village?.message} />
        </div>

        <div>
          <label
            htmlFor="contactAddress.po"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            P.O. <span className="text-red-500">*</span>
          </label>
          <input
            id="contactAddress.po"
            type="text"
            className="input-field"
            aria-invalid={errors.contactAddress?.po ? true : undefined}
            {...register("contactAddress.po")}
          />
          <FieldError message={errors.contactAddress?.po?.message} />
        </div>

        <div>
          <label
            htmlFor="contactAddress.district"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            District <span className="text-red-500">*</span>
          </label>
          <input
            id="contactAddress.district"
            type="text"
            className="input-field"
            aria-invalid={errors.contactAddress?.district ? true : undefined}
            {...register("contactAddress.district")}
          />
          <FieldError message={errors.contactAddress?.district?.message} />
        </div>

        <div>
          <label
            htmlFor="contactAddress.pin"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            PIN <span className="text-red-500">*</span>
          </label>
          <input
            id="contactAddress.pin"
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="input-field"
            aria-invalid={errors.contactAddress?.pin ? true : undefined}
            {...register("contactAddress.pin")}
          />
          <FieldError message={errors.contactAddress?.pin?.message} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="contactAddress.state"
            className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
          >
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="contactAddress.state"
            className="input-field"
            aria-invalid={errors.contactAddress?.state ? true : undefined}
            {...register("contactAddress.state")}
          >
            <option value="" disabled>
              Select state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state.code} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.contactAddress?.state?.message} />
        </div>
      </div>
    </div>
  );
}
