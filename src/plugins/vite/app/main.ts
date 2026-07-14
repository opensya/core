import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "./app.vue";

import { routes } from "virtual:router";
import { componentsPlugin } from "virtual:components";

import { pluginsPlugin } from "virtual:plugins";
import "./helpers/plugin.js";

const app = createApp(App);

app.use(componentsPlugin);
app.use(pluginsPlugin);

const router = createRouter({ routes, history: createMemoryHistory() });
app.use(router);

app.mount("#root");
