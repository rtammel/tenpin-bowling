<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto">
      <Spinner v-if="loading" />
      <div v-else-if="events.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <div v-for="event in events" :key="event.event_id" class="bg-white rounded-[20px] lg:hover:scale-[1.045] transition-transform duration-300 border border-slate-200 shadow-xs">
          <EventCard :link="`results/${event.event_id}`" :event="event" />
        </div>
      </div>
      <p v-else class="text-center p-4">No results available.</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { Event } from "@/types/Event";
import EventCard from "@/components/EventCard.vue";
import Spinner from "@/components/Spinner.vue";
import ResultService from "@/services/ResultService";

const eventService = new ResultService();
const events = ref<Event[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    events.value = await eventService.getResults();
  } catch {
    throw new Error("Failed to fetch events");
  } finally {
    loading.value = false;
  }
});
</script>
