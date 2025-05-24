<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const hiddenRoutes = ['/login', '/register'];
const showHeader = computed(() => {
  return !hiddenRoutes.includes(route.path);
});
</script>

<template>
  <Header v-if="showHeader" />
  <RouterView />
</template>
