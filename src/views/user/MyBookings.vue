<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <div v-if="bookingsData" class="lg:w-[600px] mx-auto lg:my-[24px]">
        <h1 class="text-[28px] text-bold mb-6 lg:mb-8">My Bookings</h1>
        <div class="flex justify-center space-x-2 border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['p-4 font-medium transition', activeTab === tab.id ? 'mb-0 border-b-[4px] border-violet-600 text-violet-600' : 'mb-[4px] hover:text-violet-600 text-gray-500']"
            @click="activeTab = tab.id">
            {{ tab.name }}
          </button>
        </div>
        <div v-if="activeTab === 'current'" class="my-[32px]">
          <div v-if="bookingsData.current.length">
            <h2>Current Events</h2>
            <div v-for="event in bookingsData.current" :key="event.event_id" class="event-card">
              <h3>{{ event.event_name }}</h3>
              <p>{{ event.start_date }}</p>
              <h2>Squads</h2>
              <div v-for="squad in event.squads" :key="squad.squad_id">
                {{ squad.squad_name }}
              </div>
            </div>
          </div>
          <div v-else class="p-[16px] text-center"><p>You have no registrations for current events.</p></div>
        </div>
        <div v-if="activeTab === 'upcoming'" class="my-[32px]">
          <div v-if="bookingsData.upcoming.length">
            <h2>Upcoming Events</h2>
            <div v-for="event in bookingsData.upcoming" :key="event.event_id">
              {{ event.event_name }} - {{ event.start_date }}
            </div>
          </div>
          <div v-else class="p-[16px] text-center"><p>You have no registrations for upcoming events.</p></div>
        </div>
        <div v-if="activeTab === 'past'" class="my-[32px]">
          <div v-if="bookingsData.past.length">
            <RouterLink :to="`/results/${event.event_id}`" class="flex items-center w-full p-[16px] md:px-[20px] md:py-[20px] border border-gray-200 rounded-xl hover:bg-gray-50 transition duration-300" v-for="event in bookingsData.past" :key="event.event_id">
              <div :style="{ backgroundImage: `url('${event.image_url}')` }" class="w-[180px] h-[120px] bg-cover bg-center mr-[24px] rounded-lg bg-no-repeat"></div>
              <div>
                <p>{{ event.start_date }} - {{ event.end_date }}</p>
                <h3 class="mb-2 text-[20px] font-bold text-violet-600">{{ event.event_name }}</h3>
                <div>
                  <a v-for="squad in event.squads" :key="squad.squad_id" href="#" class="text-violet-600 hover:underline">{{ squad.squad_name }}</a>
                </div>
              </div>
            </RouterLink>
          </div>
          <div v-else class="p-[16px] text-center"><p>You have no registrations for past events.</p></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { Squad } from "@/types/Squad";
import UserService from "@/services/UserService";


interface Event {
  event_id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  image_url: string;
  squads?: Squad[];
}

const bookingsData = ref<{ current: Event[]; upcoming: Event[]; past: Event[] }>({
  current: [],
  upcoming: [],
  past: [],
});

const tabs = ref([
  { id: 'current', name: 'Current Events' },
  { id: 'upcoming', name: 'Upcoming Events' },
  { id: 'past', name: 'Past Events' }
]);

const activeTab = ref('current');

const userService = new UserService();

const fetchEvents = async () => {
  try {
    bookingsData.value = await userService.getBookings();
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

onMounted(() => {
  fetchEvents();
});
</script>
