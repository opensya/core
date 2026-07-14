import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "./app.vue";

import { routes } from "virtual:router";
import { componentsPlugin } from "virtual:components";

const app = createApp(App);

app.use(componentsPlugin);

const router = createRouter({ routes, history: createMemoryHistory() });
app.use(router);

app.mount("#root");
