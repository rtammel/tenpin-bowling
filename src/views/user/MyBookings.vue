<template>
  <div>
    <h1>My Bookings</h1>

    <div class="tabs">
      <button @click="activeTab = 'current'" :class="{ active: activeTab === 'current' }">Current Events</button>
      <button @click="activeTab = 'upcoming'" :class="{ active: activeTab === 'upcoming' }">Upcoming Events</button>
      <button @click="activeTab = 'past'" :class="{ active: activeTab === 'past' }">Past Events</button>
    </div>

    <div v-if="activeTab === 'current'">
      <h2>Current Events</h2>
      <div v-for="event in currentEvents" :key="event.event_id" class="event-card">
        <h3>{{ event.event_name }}</h3>
        <p>{{ event.start_date }}</p>
        <h4>Squads</h4>
        <ul>
          <li v-for="squad in event.squads" :key="squad.squad_id">{{ squad.squad_name }}</li>
        </ul>
      </div>
    </div>

    <div v-if="activeTab === 'upcoming'">
      <h2>Upcoming Events</h2>
      <ul>
        <li v-for="event in upcomingEvents" :key="event.event_id">
          {{ event.event_name }} - {{ event.start_date }}
        </li>
      </ul>
    </div>

    <div v-if="activeTab === 'past'">
      <h2>Past Events</h2>
      <ul>
        <li v-for="event in pastEvents" :key="event.event_id">
          {{ event.event_name }} - {{ event.start_date }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Event } from "@/types/Event";
import UserService from "@/services/UserService";

const activeTab = ref("current");
const currentEvents = ref<Event[]>([]);
const upcomingEvents = ref<Event[]>([]);
const pastEvents = ref<Event[]>([]);

const userService = new UserService();

const fetchEvents = async () => {
  try {
    const events = await userService.getBookings();

    const now = new Date();

    currentEvents.value = events.filter((event: Event) => event.squads && event.squads.length > 0 && new Date(event.start_date) <= now);
    upcomingEvents.value = events.filter((event: Event) => new Date(event.start_date) > now);
    pastEvents.value = events.filter((event: Event) => new Date(event.end_date) < now);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

onMounted(() => {
  fetchEvents();
});
</script>
