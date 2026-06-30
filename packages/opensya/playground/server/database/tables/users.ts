import { validateDocFile } from "@@/modules/storage/server/tools";
import { string, uuid } from "@core/server";

export const id = uuid().defaultRandom().primary().require();

export const profilePictureId = uuid()
  .relation({
    to: "docFile.id",
    type: "one",

    alias: "profilePicture",
    inverse: { alias: "profiles" },
  })
  .validate(async (fileId?: string) => {
    if (typeof fileId === "undefined") return null;
    if (fileId === null) return null;

    await validateDocFile(fileId, {
      throw: true,
      allowedMimeTypes: ["image/png", "image/jpeg"],
    });

    return null;
  });

export const firstName = string()
  .require()
  .validate((value?: string) => {
    if (typeof value === "undefined") return null;
    if (!value) return "First name is required";
    if (value.length < 2) return "First name must be at least 2 characters";
    if (value.length > 50) return "First name must be at most 50 characters";
    if (!/^[\p{L}\s'-]+$/u.test(value))
      return "First name contains invalid characters";
    return null;
  });

export const lastName = string()
  .require()
  .validate((value?: string) => {
    if (typeof value === "undefined") return null;
    if (!value) return "Last name is required";
    if (value.length < 2) return "Last name must be at least 2 characters";
    if (value.length > 50) return "Last name must be at most 50 characters";
    if (!/^[\p{L}\s'-]+$/u.test(value))
      return "Last name contains invalid characters";
    return null;
  });

export const title = string().validate((value?: string) => {
  if (typeof value === "undefined") return null;
  if (!value) return null;
  if (value.length > 100) return "Title must be at most 100 characters";
  return null;
});

export const username = string().validate(
  async (value: string | undefined, data) => {
    if (typeof value === "undefined") return null;
    if (!value) return null;
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 30) return "Username must be at most 30 characters";
    if (!/^[a-z0-9_.-]+$/.test(value))
      return "Username can only contain lowercase letters, numbers, underscores, dots and dashes";
    if (/^[_.-]|[_.-]$/.test(value))
      return "Username cannot start or end with a special character";

    const { db, tables, orm } = await import("@core/server");
    const [existing] = await db
      .select({ id: tables.users.id })
      .from(tables.users)
      .where(orm.eq(tables.users.username, value))
      .limit(1);

    if (existing && existing.id !== data?.id) return "Username already taken";

    return null;
  },
);

export const email = string().require().unique().index({ unique: true });
export const password = string();
