import { join, relative } from "node:path";
import { getDirs } from "../utils";
import { normalizeDir } from "@opensya/utils";

const template = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="{{main}}"></script>
  </body>
</html>
`;

export function getIndexHtml() {
  const { CORE_DIR_CLIENT } = getDirs();
  return template.replace(
    "{{main}}",
    normalizeDir(relative(process.cwd(), join(CORE_DIR_CLIENT, "main.tsx"))),
  );
}
