import { createApp } from "vue";
import App from "./app.vue";

import "virtual:css";
import "virtual:composables";

import router from "./router.js";
import { componentsPlugin } from "virtual:components";

import { pluginsPlugin } from "virtual:plugins";
import "./helpers/plugin.js";

const app = createApp(App);

app.use(componentsPlugin);
app.use(pluginsPlugin);
app.use(router);

app.mount("#root");
