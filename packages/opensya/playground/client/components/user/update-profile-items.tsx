import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user";

interface UserUpdateProfileForm {
  firstName: string;
  lastName: string;
  title: string;
  username: string;
  email: string;
}

export function UserUpdateProfileItems() {
  const [submitting, setSubmitting] = useState<
    keyof UserUpdateProfileForm | null
  >(null);
  const { user, update } = useUser();

  const form = useForm<UserUpdateProfileForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    form.reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      title: user?.title ?? null,
      username: user?.username ?? null,
      email: user?.email,
    });
  }, [user, form]);

  async function onSubmit(field: keyof UserUpdateProfileForm) {
    const values = form.getValues();
    if (!user) return;
    if (values[field] === user[field]) return;

    setSubmitting(field);

    try {
      await update({ [field]: values[field] });

      toast.success("Profile updated");
    } finally {
      setSubmitting(null);
    }
  }

  const fields: {
    name: keyof UserUpdateProfileForm;
    label: string;
    placeholder: string;
    description?: string;
  }[] = [
    { name: "firstName", label: "First name", placeholder: "John" },
    { name: "lastName", label: "Last name", placeholder: "Doe" },
    {
      name: "title",
      description: "Your job title or role",
      label: "Title",
      placeholder: "Software Engineer",
    },
    {
      name: "username",
      description: "One word, like a nickname or first name",
      label: "Username",
      placeholder: "@johndoe",
    },
  ];

  return (
    <>
      {fields.map(({ name, description, label, placeholder }) => (
        <Controller
          key={name}
          name={name}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                {description && (
                  <FieldDescription>{description}</FieldDescription>
                )}
              </FieldContent>

              <div>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={placeholder}
                    autoComplete="off"
                    disabled={submitting === name}
                    onBlur={() => onSubmit(name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSubmit(name);
                      }
                    }}
                  />

                  {submitting === name && (
                    <InputGroupAddon align="inline-end">
                      <Spinner />
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
            </Field>
          )}
        />
      ))}

      <Controller
        key="email"
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            </FieldContent>

            <div>{user?.email}</div>
          </Field>
        )}
      />
    </>
  );
}
