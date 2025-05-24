<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <Spinner v-if="loading" />
      <div v-if="eventData">
        <div :style="{ backgroundImage: `linear-gradient(rgba(77,23,154,0.7),rgba(77,23,154,0.7)),url('${eventData.image_url}')` }" class="text-white px-[42px] py-[80px] lg:p-[112px] bg-cover bg-center text-center rounded-xl bg-no-repeat">
          <h1 class="text-[28px] lg:text-[32px] font-bold">{{ eventData.event_name }}</h1>
          <p class="mt-6 font-bold">{{ formatDateShort(eventData.start_date) }} - {{ formatDateShort(eventData.end_date) }}</p>
          <p class="mt-4 font-bold">{{ eventData.location_name }}, {{ eventData.location_address }}</p>
        </div>
        <div class="mt-[16px] md:mt-[24px] flex space-x-2 justify-center border-b border-slate-200">
          <!--<button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['px-4 py-4 font-medium transition cursor-pointer hover:text-violet-600', activeTab === tab.id ? 'mg-0 border-b-2 border-violet-600 text-violet-600' : 'mb-[2px] text-gray-500']"
            @click="activeTab = tab.id">
            {{ tab.name }}
          </button>-->
          <router-link v-for="tab in tabs" :key="tab.id" :to="`/results/${eventId}${tab.to}`">{{ tab.name }}</router-link>
          <!--<router-link :to="`/results/${eventId}/players`" :class="isActive('players') ? 'test': 'no'">Bowlers List</router-link>
          <router-link :to="`/results/${eventId}/squads`" :class="isActive('squads') ? 'test': 'no'">Schedule</router-link>-->
        </div>
        <router-view></router-view>

        <div v-if="activeTab === 'players'" class="my-[24px]">
          <div v-if="eventData.players.length" class="overflow-x-auto">
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
                <tr v-for="(player, index) in eventData.players" :key="index">
                  <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {{ index + 1 }}.
                  </td>
                  <td class="p-4 whitespace-nowrap text-sm font-medium">
                    <RouterLink :to="`${eventId}/${player.player_id}`" class="underline hover:text-violet-600">{{ player.fullname }}</RouterLink>
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
        </div>
        <div v-if="activeTab === 'schedule'" class="my-[24px]">
          <div v-if="eventData.schedule.length">
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
                <tr v-for="(squad, index) in eventData.schedule" :key="index">
                  <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {{ index + 1 }}.
                  </td>
                  <td class="p-4 whitespace-nowrap text-sm font-medium">
                    <RouterLink :to="`squads/${squad.squad_id}`" class="underline hover:text-violet-600">{{ squad.squad_name }}</RouterLink>
                  </td>
                  <td class="p-4 whitespace-nowrap text-sm">
                    {{ formatDateShort(squad.squad_datetime) }}
                  </td>
                  <td class="p-4 whitespace-nowrap text-sm">
                    {{ formatTime(squad.squad_datetime) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-[16px] text-center">
            <p>No schedule yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';
import type { EventResults } from "@/types/Results";
import { formatTime, formatDateShort } from "@/utils/formatDate";
import Spinner from "@/components/Spinner.vue";
import ResultService from "@/services/ResultService";

const eventService = new ResultService();
const route = useRoute();
const eventId = route.params.eventId as string;
const eventData = ref<EventResults | null>(null);
const loading = ref(true);
const error = ref('');

/*const isActive = (subPath: string) => {
  console.log(route.path);
  if(route.path.includes(subPath)) {
    console.log("YES")
  }
  return computed(() => route.path.includes(subPath));
};*/

const tabs = ref([
  { id: 'standings', name: 'All Standings', to: '/standings' },
  { id: 'players', name: 'Bowlers List', to: '/players' },
  { id: 'squads', name: 'Schedule', to: '/squads' }
]);

const activeTab = ref('squads');

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
