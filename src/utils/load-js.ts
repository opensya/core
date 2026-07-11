import { pathToFileURL } from "url";

export async function loadDefaultJs<JType>(file: string) {
  const href = pathToFileURL(file).href;
  const content = (await import(href)) as { default?: JType };

  if (!content.default) return null;
  return content.default;
}

export async function loadJs<JType>(file: string) {
  const href = pathToFileURL(file).href;
  const content = (await import(href)) as JType;

  return content;
}
