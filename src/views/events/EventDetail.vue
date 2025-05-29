<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <Spinner v-if="loading" />
      <div v-if="data.event">
        <div :style="{ backgroundImage: `linear-gradient(rgba(77,23,154,0.7),rgba(77,23,154,0.7)),url('${data.event.image_url}')` }" class="text-white px-[42px] py-[80px] lg:p-[112px] bg-cover bg-center text-center mb-[24px] rounded-xl bg-no-repeat">
          <h1 class="text-[28px] lg:text-[32px] font-bold">{{ data.event.event_name }}</h1>
          <a v-if="new Date(data.event.end_date) > new Date() && data.event.squads?.length" :href="`/events/register/${data.event.event_id}`" class="inline-block h-[48px] leading-[48px] mt-10 px-6 bg-white text-violet-800 font-bold rounded-[8px] hover:text-violet-900 hover:bg-violet-100 transition duration-300">Register to the event</a>
        </div>
        <div class="flex justify-center space-x-2 border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['p-4 font-medium transition', activeTab === tab.id ? 'mb-0 border-b-[4px] border-blue-600 text-blue-600' : 'mb-[4px] text-gray-500']"
            @click="activeTab = tab.id">
            {{ tab.name }}
          </button>
        </div>
        <div class="lg:px-[144px]">
          <div v-if="activeTab === 'squads'">
            <div v-if="groupedSquads.length" class="mb-[48px]">
              <div v-for="group in groupedSquads" :key="group.date" class="flex flex-col">
                <div class="mt-[30px] mb-[16px]"><h3 class="text-[22px] font-bold">{{ formatDate(group.date) }}</h3></div>
                <div class="border border-gray-200 rounded-xl">
                  <RouterLink v-for="squad in group.squads" :key="squad.squad_id" :to="'/squads/' + squad.squad_id" class="block w-full p-[16px] md:px-[40px] md:py-[20px] border-b border-gray-200 last:border-none hover:bg-gray-50 transition duration-300">
                    <div class="flex items-stretch w-full justify-flex-start">
                      <div class="flex flex-col md:flex-row w-full">
                        <div class="flex w-[300px] flex-col pr-[40px] justify-center">
                          <h3 class="text-[20px] font-bold text-violet-600">{{ squad.squad_name }}</h3>
                          <div>Starts at {{ formatTime(squad.squad_date_time) }}</div>
                        </div>
                        <div class="flex flex-col xl:flex-row w-full justify-center xl:items-center md:border-l-[1px] border-gray-200">
                          <div class="md:mx-[16px]">
                            <strong class="text-[24px]">€{{ squad.entry_price }}</strong>
                            <span class="uppercase text-[12px] text-gray-500 ml-2">Entry</span>
                          </div>
                          <div class="md:mx-[16px]">
                            <strong class="text-[24px]">€{{ squad.reentry_price }}</strong>
                            <span class="uppercase text-[12px] text-gray-500 ml-2">1st re-entry</span>
                          </div>
                        </div>
                      </div>
                      <SquadOccupationIndicator :squad="squad" />
                    </div>
                  </RouterLink>
                </div>
              </div>
            </div>
            <div v-else class="p-[16px] my-[32px] text-center">No squads available.</div>
          </div>
          <div v-if="activeTab === 'players'">
            <div v-if="data.users.length" class="mt-[30px] mb-[48px]">
              <table class="w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th v-for="index in maxSquads" :key="index" scope="col" class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">{{ index }}</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  <tr v-for="(user, index) in formattedUsers" :key="index">
                    <td class="p-4 whitespace-nowrap text-sm">
                      {{ index + 1 }}.
                    </td>
                    <td class="p-4 whitespace-nowrap text-sm">
                      {{ user.fullname }}
                    </td>
                    <td class="p-4 whitespace-nowrap text-sm">
                      {{ user.country }}
                    </td>
                    <td class="p-4 whitespace-nowrap text-sm text-center">
                      {{ user.gender }}
                    </td>
                    <td v-for="(squad, index) in maxSquads" :key="index" class="p-4 whitespace-nowrap text-sm text-center">
                      <RouterLink :to="`/squads/${user.squadData[index].squad_id}`" class="text-violet-600 hover:underline">{{ user.squadData[index].squad_name }}</RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-[16px] my-[32px] text-center">No registered players yet.</div>
          </div>
          <div v-if="activeTab === 'stats'">
            <div v-if="data.stats.countries.length">
              <h2>Player Stats by Country</h2>
              <ul>
                <li v-for="countryStat in data.stats.countries" :key="countryStat.user_country">
                  {{ countryStat.user_country }}: {{ countryStat.user_count }} players
                </li>
              </ul>
            </div>
            <div v-else class="p-[16px] my-[32px] text-center">No stats available.</div>
          </div>
          <div class="flex gap-4 md:gap-6">
            <div class="flex flex-col w-1/2 py-4 px-6 bg-violet-50 rounded-xl">
              <div class="font-medium">Total entries</div>
              <div class="text-right text-[32px] font-bold">{{ data.stats.total_registrations }}</div>
            </div>
            <div class="flex flex-col w-1/2 p-4 bg-violet-50 rounded-xl">
              <div class="font-medium">Total players</div>
              <div class="text-right text-[32px] font-bold">{{ data.stats.total_players }}</div>
            </div>
          </div>
        </div>
        <div class="text-center py-12">
          <h2 class="mb-2 text-[28px] font-bold">Event location</h2>
          <p>{{ data.event.location_name }}</p>
          <p>{{ data.event.location_address }}</p>
        </div>
        <Map :latitude="Number(data.event.latitude)" :longitude="Number(data.event.longitude)" :tooltipText="data.event.location_name" class="rounded-xl"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { EventData } from '@/types/EventData';
import type { Squad } from '@/types/Squad';
import { useRouter, useRoute } from 'vue-router';
import { formatDate, formatTime } from '@/utils/formatDate';
import SquadOccupationIndicator from '@/components/SquadOccupationIndicator.vue';
import EventService from '@/services/EventService';
import Spinner from "@/components/Spinner.vue";
import Map from '@/components/Map.vue';

const eventService = new EventService();
const route = useRoute();
const router = useRouter();
const eventId = route.params.eventId as string;
const loading = ref(true);

const data = ref<EventData>({
  event: null,
  squads: [],
  users: [],
  stats: {
    total_registrations: 0,
    total_players: 0,
    countries: [],
  },
});

const tabs = ref([
  { id: 'squads', name: 'Squads' },
  { id: 'players', name: 'Players' },
  { id: 'stats', name: 'Stats' }
]);

const activeTab = ref('squads');

const formattedUsers = computed(() =>
  data.value.users.map((user) => ({
    user_id: user.user_id,
    fullname: user.user_fullname,
    country: user.country || "Unknown",
    gender: user.gender || "",
    clubname: user.clubname || "",
    squadData: user.squads.map((s) => ({
      squad_id: s.squad_id,
      squad_name: s.squad_name,
    })),
  }))
);

const maxSquads = computed(() =>
  Math.max(...data.value.users.map((user) => user.squads.length), 0)
);

const groupedSquads = computed(() => {
  const groups: Record<string, { date: string; squads: Squad[] }> = {};

  data.value.squads.forEach((squad: Squad) => {
    const date = squad.squad_date_time.split(' ')[0];

    if (!groups[date]) {
      groups[date] = { date, squads: [] };
    }

    groups[date].squads.push(squad);
  });

  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
});

onMounted(async () => {
  try {
    data.value = await eventService.getEventById(eventId);
  } catch {
    router.push('/events');
  } finally {
    loading.value = false;
  }
});
</script>
