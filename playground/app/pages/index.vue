<script lang="ts" setup>
useTestComposable();
definePageMeta({ test: "yeaaaaaaaaah", layout: "admin" });
</script>

<template>
  <SubUseTest />
  {{ $route.meta }}
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt asperiores
  error perferendis cupiditate. Quae est eos vero nisi doloribus, enim fugit
  praesentium! Sunt dolore debitis, autem rerum in fugiat nisi.
</template>
