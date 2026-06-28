import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { uploadFile } from "@@/modules/storage/client/lib/api";
import { useApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useSession } from "@/providers/02.session.global";
import { FileImage } from "@@/modules/storage/client/components/file-image";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OrganisationLogoUpdate() {
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);
  const { organisation, reload } = useSession();

  interface OrganisationLogoForm {
    logo: FileList | null;
  }

  const form = useForm<OrganisationLogoForm>({
    defaultValues: { logo: null },
  });

  async function onSubmit(file: File) {
    if (!organisation) return;

    setSubmitting(true);

    try {
      const { fileId } = await uploadFile(file, {
        ownerId: organisation.id,
        ownerType: "organisation",
      });

      await api("/api/organisation", {
        method: "post",
        body: { logoId: fileId },
      });

      toast.success("Logo updated");
      await reload();
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!organisation) return;

    setSubmitting(true);

    try {
      await api("/api/organisation", {
        method: "post",
        body: { logoId: null },
      });

      toast.success("Logo removed");
      await reload();
    } catch {
      toast.error("Failed to remove logo");
    } finally {
      setSubmitting(false);
    }
  }

  function upload() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/png, image/jpeg";

    input.addEventListener("change", () => {
      const file = input.files?.item(0);
      if (file) onSubmit(file);
    });

    input.click();
  }
  return (
    <Controller
      name="logo"
      control={form.control}
      render={({ fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal">
          <FieldContent>
            <FieldLabel>Logo</FieldLabel>
            <FieldDescription>Recommended size is 256x256px</FieldDescription>
          </FieldContent>

          <div className="flex items-center gap-3">
            <FileImage fileId={organisation?.logoId}>
              {(url) => (
                <Avatar size="lg" className="cursor-pointer " onClick={upload}>
                  {submitting ? (
                    <Spinner className="absolute inset-1/2 -translate-1/2" />
                  ) : (
                    <>
                      <AvatarImage src={url ?? undefined} />

                      {organisation && (
                        <AvatarFallback>
                          {organisation.name.at(0)}
                        </AvatarFallback>
                      )}

                      {url && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AvatarBadge
                              className="size-5 bg-red-500"
                              onClick={onRemove}
                            >
                              <X />
                            </AvatarBadge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Delete logo</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Avatar>
              )}
            </FileImage>
          </div>
        </Field>
      )}
    />
  );
}
