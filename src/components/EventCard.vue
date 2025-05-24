<template>
  <RouterLink :to="link" class="flex flex-col h-full">
    <div :style="{ backgroundImage: `url('${event.image_url}')` }" class="relative h-[240px] bg-cover bg-center rounded-tl-[20px] rounded-tr-[20px] bg-no-repeat border-b border-slate-200">
        <div :style="{ backgroundImage: `url(${getFlagUrl(event.country)})` }" class="absolute top-4 left-4 bg-cover h-[40px] w-[40px] rounded-full bg-no-repeat bg-position-[50%] border border-slate-400"></div>
    </div>
    <div class="flex flex-1 flex-col p-4 text-center justify-between">
      <div>
        <div class="text-violet-600 py-2">{{ formatDateShort(event.start_date) }} - {{ formatDateShort(event.end_date) }}</div>
        <h2 class="text-[20px] font-bold py-2">{{ event.event_name }}</h2>
        <p class="text-[12px] uppercase py-2">{{ event.location_name }}, {{ event.location_address }}</p>
      </div>
      <div v-if="event.occupation_rate && event.total_registrations" class="grid grid-cols-3 gap-3 mt-4">
        <div class="bg-violet-50 rounded-[8px] p-2">
          <div class="text-[22px] font-bold">1</div>
          <div class="uppercase text-[10px] font-medium">Playing mode</div>
        </div>
        <div class="bg-violet-50 rounded-[8px] p-2">
          <div class="text-[22px] font-bold">{{ event.occupation_rate }} %</div>
          <div class="uppercase text-[10px] font-medium">Occupation</div>
        </div>
        <div class="bg-violet-50 rounded-[8px] p-2">
          <div class="text-[22px] font-bold">{{ event.total_registrations }}</div>
          <div class="uppercase text-[10px] font-medium">Registrations</div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
<script lang="ts" setup>
import type { Event } from "@/types/Event";
import { formatDateShort } from "@/utils/formatDate";

defineProps<{link: string, event: Event}>();

const getFlagUrl = (code: string): string => {
  return `/flags/${code}.svg`;
};
</script>
