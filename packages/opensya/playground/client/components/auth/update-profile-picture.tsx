import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

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

export function AuthUpdateProfilePicture() {
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);
  const { user, reload } = useSession();

  interface UserProfilePictureForm {
    profilePicture: FileList | null;
  }

  const form = useForm<UserProfilePictureForm>({
    defaultValues: { profilePicture: null },
  });

  async function onSubmit(file: File) {
    if (!user) return;

    setSubmitting(true);

    try {
      const { fileId } = await uploadFile(file, {
        ownerId: user.id,
        ownerType: "user",
      });

      await api("/api/auth/profile", {
        method: "post",
        body: { profilePictureId: fileId },
      });

      toast.success("Profile picture updated");
      await reload();
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) return;

    setSubmitting(true);

    try {
      await api("/api/auth/profile", {
        method: "post",
        body: { profilePictureId: null },
      });

      toast.success("Profile picture removed");
      await reload();
    } catch {
      toast.error("Failed to remove profile picture");
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
      name="profilePicture"
      control={form.control}
      render={({ fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal">
          <FieldContent>
            <FieldLabel>Profile picture</FieldLabel>
          </FieldContent>

          <div className="flex items-center gap-3">
            <FileImage fileId={user?.profilePictureId}>
              {(url) => (
                <Avatar size="lg" className="cursor-pointer " onClick={upload}>
                  {submitting ? (
                    <Spinner className="absolute inset-1/2 -translate-1/2" />
                  ) : (
                    <>
                      <AvatarImage src={url ?? undefined} />

                      {user && (
                        <AvatarFallback>{user.firstName.at(0)}</AvatarFallback>
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
                            <p>Delete profile picture</p>
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
