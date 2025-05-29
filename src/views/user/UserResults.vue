<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <h1 class="text-[28px] text-bold mb-6 lg:mb-8">My results</h1>
    <div v-if="resultsData.length">
      <p>Data</p>
      <div v-for="result in resultsData" :key="result.event_id" class="bg-white rounded-[20px] lg:hover:scale-[1.045] transition-transform duration-300 border border-slate-200 shadow-xs p-4 mb-4">
        <h3 class="text-lg font-bold">{{ result.event_name }}</h3>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Event } from "@/types/Event";
import UserService from "@/services/UserService";

const userService = new UserService();
const loading = ref(true);
const resultsData = ref<Event[]>([]);

onMounted(async () => {
  try {
    resultsData.value = await userService.getResults();
    //response = await userService.getResults();
  } catch {
    throw new Error("Failed to fetch events");
  } finally {
    loading.value = false;
  }
});
</script>
