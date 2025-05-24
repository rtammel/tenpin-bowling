<template>
  <div v-if="event">
    <h1>Register for {{ event?.event_name }}</h1>
    <form @submit.prevent="registerUser">
      <div v-if="groupedSquads.length">
        <h2>Select Squads:</h2>
        <div v-for="group in groupedSquads" :key="group.date">
          <h3>{{ formatDate(group.date) }}</h3>
          <div v-for="squad in group.squads" :key="squad.squad_id">
            <label>
              <input
                type="checkbox"
                v-model="selectedSquads"
                :value="squad.squad_id"
                :disabled="squad.registered_players >= squad.max_players"
               />
              {{ squad.squad_name }} ({{ formatTime(squad.squad_date_time) }})
            </label>
            <p>Entry Price: €{{ squad.entry_price }}</p>
            <p>Reentry Price: €{{ squad.reentry_price }}</p>
            <p>Players Registered: {{ squad.registered_players }}/{{ squad.max_players }}</p>
          </div>
        </div>
      </div>
      <p v-else>No squads available.</p>

      <button type="submit">Submit Registration</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Event } from '@/types/Event';
import type { Squad } from '@/types/Squad';
import { formatDate, formatTime } from '@/utils/formatDate';
import RegistrationService from '@/services/RegistrationService';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const registrationService = new RegistrationService();
const eventId = route.params.eventId as string;
const event = ref<Event | null>(null);
const squads = ref<Squad[]>([]);
const registeredSquads = ref<number[]>([]);
const selectedSquads = ref<number[]>([]);

const fetchEventData = async () => {
  try {
    const response = await registrationService.getEventDataById(eventId);
    event.value = response;
    squads.value = response.squads || [];
    registeredSquads.value = response.registeredSquads || [];
    selectedSquads.value = [...registeredSquads.value];
  } catch {
    router.push("/events")
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
    alert("Please select at least one squad.");
    return;
  }

  try {
    await axios.post('http://localhost:3000/api/registrations/register', {
      squadIds: selectedSquads.value,
    }, {
      withCredentials: true,
    });

    alert("Registration successful!");
    router.push(`/events/${eventId}`); // Redirect back to event page
  } catch (error) {
    console.error("Error registering user:", error);
    router.push("/events");
  }
};

onMounted(fetchEventData);
</script>
