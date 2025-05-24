<template>
  <Spinner v-if="loading" />
  <div v-if="eventData && eventData.standings.length" class="my-[24px] overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Pos.
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Country
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Avg.
          </th>
          <th v-for="n in 6" :key="n" scope="col" class="px-4 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
            P{{ n }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-200">
        <tr v-for="(player, index) in eventData.standings" :key="index">
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
            {{ index + 1 }}.
          </td>
          <td class="p-4 whitespace-nowrap text-sm font-medium">
            <RouterLink :to="`players/${player.player_id}`" class="underline hover:text-violet-600">{{ player.fullname }}</RouterLink>
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ player.country }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ player.total_score }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ player.avg_score }}
          </td>
          <td v-for="game in player.games" :key="game.game_number" class="p-4 whitespace-nowrap text-center text-sm" :class="getScoreClass(game.score)">
            {{ game.score }}
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
import type { EventResults } from "@/types/Results";
import Spinner from "@/components/Spinner.vue";
import ResultService from "@/services/ResultService";

const eventService = new ResultService();
const route = useRoute();
const eventId = route.params.eventId as string;
const eventData = ref<EventResults | null>(null);
const loading = ref(true);
const error = ref('');

const getScoreClass = (score: number) => {
  if (score === 300) {
    return 'bg-red-500 font-bold text-white';
  } else if (score >= 250) {
    return 'text-red-500 font-bold';
  } else if (score >= 200) {
    return 'text-red-500';
  }
  return '';
};

onMounted(async () => {
  try {
    eventData.value = await eventService.getEventResultsById(eventId);
  } catch {
    error.value = "Failed to load events.";
  } finally {
    loading.value = false;
  }
});
</script>
