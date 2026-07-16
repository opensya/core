<script lang="ts" setup>
useTestComposable();
definePageMeta({
  layout: { name: "admin", props: { menu: true } },
});
</script>

<template>
  <SubUseTest hello="world" />
  {{ $route.meta }}
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt asperiores
  error perferendis cupiditate. Quae est eos vero nisi doloribus, enim fugit
  praesentium! Sunt dolore debitis, autem rerum in fugiat nisi.
</template>
