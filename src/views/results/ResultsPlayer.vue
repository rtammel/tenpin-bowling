<template>
  <Spinner v-if="loading" />
    <!--<div class="mt-[16px] md:mt-[24px] flex space-x-2 justify-center border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['px-4 py-4 font-medium transition cursor-pointer hover:text-violet-600', activeTab === tab.id ? 'mg-0 border-b-2 border-violet-600 text-violet-600' : 'mb-[2px] text-gray-500']"
        @click="activeTab = tab.id">
        {{ tab.name }}
      </button>
    </div>-->
    <div v-if="playerData" class="my-[24px]">
      <div v-if="playerData.squad_games.length" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos.
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th v-for="n in 6" :key="n" scope="col" class="px-4 py-3 text-xs text-center font-medium text-gray-500 uppercase tracking-wider">
                P{{ n }}
              </th>
              <th scope="col" class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Avg.
              </th>
              <th scope="col" class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Total
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="(squad, index) in playerData.squad_games" :key="index">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                {{ index + 1 }}.
              </td>
              <td class="p-4 whitespace-nowrap text-sm font-medium">
                <RouterLink :to="`/results/${squad.event_id}/squads/${squad.squad_id}`" class="underline hover:text-violet-600">{{ squad.squad_datetime }}</RouterLink>
              </td>
              <td v-for="game in squad.games" :key="game.game_number" class="p-4 whitespace-nowrap text-center text-sm" :class="getScoreClass(game.score)">
                {{ game.score }}
              </td>
              <td class="p-4 whitespace-nowrap text-sm text-center">
                {{ squad.avg_score }}
              </td>
              <td class="p-4 whitespace-nowrap text-sm text-center">
                {{ squad.total_score }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-[16px] text-center">
        <p>No results yet.</p>
      </div>
      <div v-for="(squad, index) in playerData.squad_games" :key="index">
        <div>
          <p>{{ squad.squad_datetime }}</p>
        </div>
        <div class="overflow-x-auto">
          <table v-for="(game, index) in squad.games" :key="index" class="w-[1200px] xl:w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="n in 10"
                  :key="n"
                  scope="col"
                  class="w-1/10 px-4 py-1 text-xs text-center font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ n }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr>
                <td v-for="(frame, index) in game.frames" :key="index" class="px-4">
                  <table class="w-full">
                    <tbody>
                      <tr>
                        <td :class="index === 9 ? 'w-1/3' : 'w-1/2'" class="py-1 whitespace-nowrap text-sm text-center">
                          {{ formatRoll(frame.roll_1, null, null) }}
                        </td>
                        <td v-if="(index !== 9 && frame.roll_1 !== 10) || (index === 9)" class="py-1 whitespace-nowrap text-sm text-center">
                          {{ formatRoll(frame.roll_1, frame.roll_2 , null) }}
                        </td>
                        <td v-if="index === 9" class="w-1/3 py-1 whitespace-nowrap text-sm text-center">
                          {{ formatRoll(null, frame.roll_2, frame.roll_3) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-center" :colspan="index === 9 ? 3 : 2">{{ frame.frame_score }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import type { PlayerResults } from "@/types/Results";
import Spinner from "@/components/Spinner.vue";
import ResultService from "@/services/ResultService";

const eventService = new ResultService();
const route = useRoute();
const eventId = route.params.eventId as string;
const userId = route.params.userId as string;
const playerData = ref<PlayerResults | null>(null);
const loading = ref(true);
const error = ref('');

const formatRoll = (roll_1?: number | null, roll_2?: number | null, roll_3?: number | null): string => {

  if (roll_1 && !roll_2) {
    if (roll_1 === 10) return 'X';
    if (roll_1 === 0) return '-';
    return roll_1.toString();
  }

  if (roll_1 && roll_2) {
    if (roll_2 === 10) return 'X';
    if (roll_2 === 0) return '-';
    if (roll_1 + roll_2 === 10) return '/';
    return roll_2.toString();
  }

  if(roll_2 && roll_3) {
    if (roll_3 === 10) return 'X';
    if (roll_3 === 0) return '-';
    if (roll_2 + roll_3 === 10) return '/';
  }

  return '';
};

const tabs = ref([
  { id: 'standings', name: 'All Standings' },
  { id: 'players', name: 'Bowlers List' },
  { id: 'schedule', name: 'Schedule' },
]);

const activeTab = ref('players');

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
    playerData.value = await eventService.getPlayerEventResultsById(eventId, userId);
  } catch {
    error.value = "Failed to load player results.";
  } finally {
    loading.value = false;
  }
});
</script>
