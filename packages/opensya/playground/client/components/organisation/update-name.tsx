import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/auth";

export function OrganisationNameUpdate() {
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);
  const { organisation, reload } = useSession();

  interface OrganisationNameForm {
    name: string;
  }

  const form = useForm<OrganisationNameForm>({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    form.reset({
      name: organisation?.name ?? "",
    });
  }, [organisation?.name, form]);

  async function onSubmit() {
    const values = form.getValues();

    if (!organisation) return;
    if (values.name === organisation.name) return;

    setSubmitting(true);

    try {
      await api("/api/organisation", {
        method: "post",
        body: values,
      });

      toast.success("Organisation name updated");

      await reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Controller
      name="name"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
          </FieldContent>

          <div>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={organisation?.name}
                autoComplete="off"
                onBlur={onSubmit}
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
              />

              {submitting && (
                <InputGroupAddon align="inline-end">
                  <Spinner />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </Field>
      )}
    />
  );
}
