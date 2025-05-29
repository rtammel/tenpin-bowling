<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <Spinner v-if="loading" />
      <div v-if="event">
        <div :style="{ backgroundImage: `linear-gradient(rgba(77,23,154,0.7),rgba(77,23,154,0.7)),url('${event.image_url}')` }" class="text-white px-[42px] py-[80px] lg:p-[112px] bg-cover bg-center text-center mb-[24px] rounded-xl bg-no-repeat">
          <h1 class="text-[28px] lg:text-[32px] font-bold">{{ event.event_name }}</h1>
          <a :href="`${baseUrl}events/${event.event_id}`" class="inline-block h-[48px] leading-[48px] mt-10 px-6 bg-white text-violet-800 font-bold rounded-[8px] hover:text-violet-900 hover:bg-violet-100 transition duration-300 cursor-pointer">Back</a>
        </div>
        <div v-if="registrationMessage" class="mb-[24px]">
          <p class="w-fill p-4 text-center border rounded-lg font-medium" :class="{ 'bg-red-50 text-red-700 border-red-400': hasError, 'bg-green-50 text-green-800 border-green-400': !hasError }">{{ registrationMessage }}</p>
        </div>
        <div v-if="groupedSquads.length" class="lg:px-[144px] md:mb-[48px]">
          <form @submit.prevent="registerUser">
            <div v-for="group in groupedSquads" :key="group.date" class="flex flex-col">
              <div class="mt-[30px] mb-[16px]">
                <h3 class="text-[22px] font-bold">{{ formatDate(group.date) }}</h3>
              </div>
              <div v-for="squad in group.squads" :key="squad.squad_id" class="border border-gray-200 rounded-xl">
                <div class="block w-full p-[16px] md:px-[32px] md:py-[20px] border-b border-gray-200 last:border-none hover:bg-gray-50 transition duration-300">
                  <label :for="`squad-${squad.squad_id}`" class="flex items-center w-full justify-flex-start cursor-pointer">
                    <input
                      :id="`squad-${squad.squad_id}`"
                      type="checkbox"
                      v-model="selectedSquads"
                      :value="squad.squad_id"
                      :disabled="squad.registered_players >= squad.max_players"
                      class="accent-violet-600 w-[32px] h-[32px] mr-[16px] md:mr-[32px] border-gray-300 rounded focus:ring-violet-500 focus:ring-2 focus-visible:outline-none"
                    />
                    <div class="flex flex-1 flex-col md:flex-row">
                      <div class="flex md:w-[300px] flex-col pr-[40px] justify-center">
                        <h3 class="text-[20px] font-bold text-violet-600">{{ squad.squad_name }}</h3>
                        <div>Starts at {{ formatTime(squad.squad_date_time) }}</div>
                      </div>
                      <div class="flex flex-col xl:flex-row w-full justify-center xl:items-center md:border-l-[1px] border-gray-200">
                        <div class="md:mx-[16px]">
                          <strong class="text-[24px]">€{{ squad.entry_price }}</strong>
                          <span class="uppercase text-[12px] text-gray-500 ml-2">Entry</span>
                        </div>
                        <div v-if="squad.reentry_price" class="md:mx-[16px]">
                          <strong class="text-[24px]">€{{ squad.reentry_price }}</strong>
                          <span class="uppercase text-[12px] text-gray-500 ml-2">1st re-entry</span>
                        </div>
                      </div>
                    </div>
                    <SquadOccupationIndicator :squad="squad" />
                  </label>
                </div>
              </div>
            </div>
            <div class="w-full text-center mt-[32px]">
              <button class="inline-block w-full md:w-auto h-[48px] leading-[48px] bg-violet-500 px-12 text-white font-bold rounded-[8px] hover:bg-violet-700 cursor-pointer transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">Save</button>
            </div>
          </form>
        </div>
        <div v-else class="p-[16px] my-[32px] text-center">No squads available.</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Event } from '@/types/Event';
import type { Squad } from '@/types/Squad';
import { formatDate, formatTime } from '@/utils/formatDate';
import RegistrationService from '@/services/RegistrationService';
import SquadOccupationIndicator from '@/components/SquadOccupationIndicator.vue';
import Spinner from "@/components/Spinner.vue";

const route = useRoute();
const router = useRouter();
const baseUrl = import.meta.env.BASE_URL || '/';
const registrationService = new RegistrationService();
const eventId = route.params.eventId as string;
const event = ref<Event | null>(null);
const squads = ref<Squad[]>([]);
const registeredSquads = ref<number[]>([]);
const selectedSquads = ref<number[]>([]);
const registrationMessage = ref<string>("");
const loading = ref(true);
const hasError = ref(false);


interface RegistrationResponse {
    event?: Event;
    squads?: Squad[];
    registeredSquads?: number[];
}

const fetchEventData = async () => {
  try {
    const response: RegistrationResponse = await registrationService.getEventDataById(eventId);
    event.value = response.event || null;
    squads.value = response.squads || [];
    registeredSquads.value = response.registeredSquads || [];
    selectedSquads.value = [...registeredSquads.value];
  } catch {
    router.push('/events');
  } finally {
    loading.value = false;
  }
};

const groupedSquads = computed(() => {
  const groups: Record<string, { date: string; squads: Squad[] }> = {};

  squads.value.forEach((squad: Squad) => {
    const date = squad.squad_date_time.split(" ")[0]; // Extract YYYY-MM-DD

    if (!groups[date]) {
      groups[date] = { date, squads: [] };
    }

    groups[date].squads.push(squad);
  });

  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
});

const registerUser = async () => {
  if (selectedSquads.value.length === 0) {
    registrationMessage.value = "Please select at least one squad to register.";
    hasError.value = true;
    return;
  }

  try {
    const response = await registrationService.registerForEvent(selectedSquads.value);
    registrationMessage.value = response.message;
    fetchEventData();
  } catch (error) {
    console.error("Error registering user:", error);
    registrationMessage.value = "Registration failed.";
    hasError.value = true;
  }
};

onMounted(fetchEventData);
</script>
