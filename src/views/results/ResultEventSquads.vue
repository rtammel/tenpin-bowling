<template>
  <Spinner v-if="loading" />
  <div v-if="squadsData" class="my-[24px] overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Sqd.
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Time
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-200">
        <tr v-for="(squad, index) in squadsData" :key="index">
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
            {{ index + 1 }}.
          </td>
          <td class="p-4 whitespace-nowrap text-sm font-medium">
            <RouterLink :to="`squads/${squad.squad_id}`" class="underline hover:text-violet-600">{{ squad.squad_name }}</RouterLink>
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ formatDateShort(squad.squad_date_time) }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ formatTime(squad.squad_date_time) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="p-[16px] text-center">
    <p>No results yet.</p>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import type { Squad } from "@/types/Squad";
import Spinner from "@/components/Spinner.vue";
import EventService from "@/services/EventService";
import { formatTime, formatDateShort } from "@/utils/formatDate";

const eventService = new EventService();
const route = useRoute();
const eventId = route.params.eventId as string;
const squadsData = ref<Squad[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    squadsData.value = await eventService.getEventByIdSquads(eventId);
  } catch {
    error.value = "Failed to load events.";
  } finally {
    loading.value = false;
  }
});
</script>
