<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { layouts } from "virtual:layouts";

const route = useRoute();

/**
 * Normalizes the layout metadata to a standard structure.
 */
const layoutConfig = computed(() => {
  const metaLayout = route.meta.layout;

  // Case 1: Layout is explicitly disabled (layout: false)
  if (metaLayout === false) {
    return { name: null, props: {} };
  }

  // Case 2: Layout is defined as an object (layout: { name: 'Admin', props: { theme: 'dark' } })
  if (metaLayout && typeof metaLayout === "object" && "name" in metaLayout) {
    return {
      name: metaLayout.name,
      props: metaLayout.props || {},
    };
  }

  // Case 3: Layout is defined as a string (layout: 'Admin') or falls back to 'Default'
  return {
    name: (metaLayout as string) || "default",
    props: {},
  };
});

/**
 * Dynamically resolves the active layout component.
 */
const currentLayout = computed(() => {
  const { name } = layoutConfig.value;
  if (!name) return null;

  const loader = layouts[name] || layouts["default"];
  if (!loader) return null;

  return defineAsyncComponent(loader);
});
</script>

<template>
  <!-- Render with layout and bind dynamic props -->
  <component
    :is="currentLayout"
    v-if="currentLayout"
    v-bind="layoutConfig.props"
  >
    <RouterView />
  </component>

  <!-- Render without layout (when layout: false or not resolved) -->
  <RouterView v-else />
</template>
