<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div v-if="squadData" class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <div :style="{ backgroundImage: `linear-gradient(rgba(77,23,154,0.7),rgba(77,23,154,0.7)),url('${squadData.image_url}')` }" class="text-white px-[42px] py-[80px] lg:p-[112px] bg-cover bg-center text-center mb-[32px] rounded-xl bg-no-repeat">
        <h1 class="text-[28px] lg:text-[32px] font-bold">{{ squadData.event_name }}</h1>
      </div>
      <nav v-if="squadData.squads.length" class="w-full mb-[32px] overflow-x-auto">
        <ul class="flex gap-2 justify-center">
          <li v-for="squad in squadData.squads" :key="squad.squad_id">
            <RouterLink :to="`/squads/${squad.squad_id}`" :class="squad.squad_id === squadData.squadId ? 'bg-violet-500 text-white' : 'bg-violet-50 hover:bg-violet-100'" class="block text-center rounded-[8px] p-2">
              <p class="m-0 text-bold text-nowrap">{{ squad.squad_name }}</p>
              <p class="m-0 text-nowrap">Thu 29/05</p>
              <p class="m-0 text-nowrap">9:00 AM</p>
            </RouterLink>
          </li>
        </ul>
      </nav>
      <div class="lg:px-[144px]">
        <div v-if="squadData.players.length">
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
                  Club
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="(player, index) in squadData.players" :key="index">
                <td class="p-4 whitespace-nowrap text-sm font-medium">
                  {{ index + 1 }}.
                </td>
                <td class="p-4 whitespace-nowrap text-sm font-medium">
                  {{ player.fullname }}
                </td>
                <td class="p-4 whitespace-nowrap text-sm font-medium">
                  {{ player.clubname }}
                </td>
                <td class="p-4 whitespace-nowrap text-sm">
                  {{ player.country || 'Unknown' }}
                </td>
                <td class="p-4 whitespace-nowrap text-sm">
                  {{ player.gender }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-[16px] text-center">No players yet.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { SquadData } from '@/types/Squad';
import { useRouter, useRoute } from 'vue-router';
import SquadService from '@/services/SquadService';

const squadService = new SquadService();
const route = useRoute();
const router = useRouter();
const squadId = route.params.squadId as string;
const loading = ref(true);
const squadData = ref<SquadData>();

const fetchSquadData = async (squadId: string) => {
  try {
    squadData.value = await squadService.getSquadById(squadId);
  } catch {
    router.push('/events');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSquadData(squadId);
});

watch(() => route.params.squadId, (newId) => {
  loading.value = true;
  if (typeof newId === 'string') {
    fetchSquadData(newId);
  }
});
</script>
