<script lang="ts" setup>
defineProps<{ menu?: boolean }>();
</script>

<template>
  <div style="background-color: aqua">
    <slot />
  </div>
</template>
