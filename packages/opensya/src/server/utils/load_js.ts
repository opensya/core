import { pathToFileURL } from "url";

export async function loadDefaultJs<JType>(file: string) {
  const href = pathToFileURL(file).href;
  const content = (await import(href)) as { default?: JType };

  if (!content.default) return null;
  return content.default;
}
