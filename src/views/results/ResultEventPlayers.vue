<template>
  <Spinner v-if="loading" />
  <div v-if="playersData" class="my-[24px] overflow-x-auto">
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
            Gms.
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Series
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            High G.
          </th>
          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Avg.
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-200">
        <tr v-for="(player, index) in playersData" :key="index">
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
            {{ player.games_played }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ player.squads_played }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm" :class="getScoreClass(player.highest_game)">
            {{ player.highest_game }}
          </td>
          <td class="p-4 whitespace-nowrap text-sm">
            {{ player.avg_score }}
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
import type { PlayerStats } from "@/types/Results";
import Spinner from "@/components/Spinner.vue";
import EventService from "@/services/EventService";

const eventService = new EventService();
const route = useRoute();
const eventId = route.params.eventId as string;
const playersData = ref<PlayerStats[]>([]);
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
    playersData.value = await eventService.getEventByIdPlayers(eventId);
  } catch {
    error.value = "Failed to load events.";
  } finally {
    loading.value = false;
  }
});
</script>
