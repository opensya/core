import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "./app.vue";
import { routes } from "virtual:router";

const router = createRouter({ routes, history: createMemoryHistory() });

createApp(App).use(router).mount("#root");
