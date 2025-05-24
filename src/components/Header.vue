<template>
  <header class="fixed inset-x-0 top-0 z-10" :class="menuOpen ? 'h-[100vh] bg-violet-700' : 'bg-white border-b-[1px] border-slate-200 shadow-xs'">
    <nav class="mx-auto md:px-10" :class="menuOpen ? 'size-full' : ''">
      <div class="md:hidden">
        <div class="flex items-center justify-between px-5 py-[16px]">
          <router-link to="/" @click="closeMenu" class="flex items-center font-bold text-[24px] px-[12px]" :class="menuOpen ? 'text-white' : 'text-[#2c3e50]'">
            <img src="/images/logo.svg" class="w-[48px] h-[48px] mr-[8px]" alt="Ten Pin" />TenPin
          </router-link>
          <button @click="toggleMenu" class="relative flex w-[48px] h-[48px] cursor-pointer">
            <span :class="menuOpen ? 'bg-transparent before:bg-white after:bg-white before:rotate-45 after:-rotate-45 after:w-full before:top-0 after:bottom-0' : ''" class="absolute top-1/2 left-[12px] right-[12px] h-[3px] bg-gray-700 -translate-y-1/2 before:content-[''] before:block before:absolute before:right-0 before:h-[3px] before:w-full before:bg-gray-700 before:transition-[top,_transform,_-webkit-transform] before:-top-[9px] after:content-[''] after:-bottom-[9px] after:bg-gray-700 after:h-[3px] after:w-1/2 after:absolute after:block after:right-0 after:transition-[bottom,_transform,_-webkit-transform]"></span>
          </button>
        </div>
        <div :class="menuOpen ? 'h-[calc(100vh-80px)] overflow-y-auto' : ''">
          <div class="md:flex h-full" :class="menuOpen ? 'flex flex-col px-[32px] justify-between w-full bg-violet-700 text-white py-[52px] h-[calc(100vh-80px)] overflow-y-auto' : 'hidden'">
            <div :class="menuOpen ? 'flex flex-col text-[24px]' : ''">
              <RouterLink to="/events" @click="closeMenu" class="font-medium transition" :class="[isActive('/events') ? 'text-violet-600' : '', menuOpen ? 'text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'hover:text-violet-600']">Events</RouterLink>
              <RouterLink to="/results" @click="closeMenu" class="font-medium transition" :class="[isActive('/results') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">Results</RouterLink>
              <RouterLink v-if="authStore.isLoggedIn" to="/profile" @click="closeMenu" class="font-medium transition" :class="[isActive('/profile') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">My Profile</RouterLink>
              <RouterLink v-if="authStore.isLoggedIn" to="/mybookings" @click="closeMenu" class="font-medium transition" :class="[isActive('/mybookings') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">My Bookings</RouterLink>
            </div>
            <div class="flex justify-center mt-[32px]">
              <button v-if="authStore.isLoggedIn" @click="logout" class="cursor-pointer py-[10px] px-[20px] text-[16px] border border-violet-500 transition duration-300 font-bold rounded-[8px] hover:bg-violet-100 hover:text-violet-700">Log Out</button>
              <RouterLink v-if="!authStore.isLoggedIn" to="/login" @click="closeMenu" class="py-[10px] px-[20px] text-[16px] border border-violet-500 transition duration-300 font-bold rounded-[8px] hover:bg-violet-100 hover:text-violet-700">Log In</RouterLink>
              <RouterLink v-if="!authStore.isLoggedIn" to="/register" @click="closeMenu" class="ml-[16px] py-[10px] px-[20px] text-[16px] text-white transition duration-300 font-bold rounded-[8px] bg-violet-500 hover:bg-violet-600">Register</RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="hidden md:flex flex items-center justify-between py-[16px]">
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center font-bold text-[24px]" :class="menuOpen ? 'text-white' : ''">
            <img src="/images/logo.svg" class="w-[48px] h-[48px] mr-[8px]" alt="Ten Pin" />
            TenPin
          </router-link>
        </div>
        <div>
          <RouterLink v-if="menuOpen || !isVisible" to="/events" class="font-medium transition" :class="[isActive('/events') ? 'text-violet-600' : '', menuOpen ? 'text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'hover:text-violet-600']">Events</RouterLink>
          <RouterLink v-if="menuOpen || !isVisible" to="/results" class="font-medium transition" :class="[isActive('/results') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">Results</RouterLink>
          <RouterLink v-if="menuOpen || isVisible" to="/profile" class="font-medium transition" :class="[isActive('/profile') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">My Profile</RouterLink>
          <RouterLink v-if="menuOpen || isVisible" to="/mybookings" class="font-medium transition" :class="[isActive('/mybookings') ? 'text-violet-600' : '', menuOpen ? 'ml-0 text-white hover:text-violet-200 pt-[8px] pb-[8px]' : 'ml-[32px] hover:text-violet-600']">My Bookings</RouterLink>
        </div>
        <div class="flex items-center">
          <RouterLink v-if="!isVisible" to="/profile" class="hover:text-violet-600">
            <img v-if="profilePicture" :src="'http://localhost:3000'+authStore.user?.profilepicture" :alt="authStore.user?.first_name" class="w-[48px] h-[48px] rounded-full"/>
            <span v-else>{{ authStore.user?.first_name }}</span>
          </RouterLink>
          <button v-if="isVisible" @click="authStore.logout" class="ml-[16px] cursor-pointer py-[10px] px-[20px] text-[16px] border border-violet-500 transition duration-300 font-bold rounded-[8px] hover:bg-violet-100">Log Out</button>
          <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="py-[10px] px-[20px] text-[16px] border border-violet-500 transition duration-300 font-bold rounded-[8px] hover:bg-violet-100">Log In</RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/register" class="ml-[12px] py-[10px] px-[20px] text-[16px] text-white transition duration-300 font-bold rounded-[8px] bg-violet-500 hover:bg-violet-600">Register</RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "../store/auth";
import { useRoute, RouterLink } from "vue-router";

const menuOpen = ref(false);
const route = useRoute();
const authStore = useAuthStore();
const isVisible = computed(() => route.path === "/profile" || route.path === "/mybookings");
const isActive = (path: string) => route.path.startsWith(path);
const profilePicture = computed(() => authStore.user?.profilepicture);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const logout = () => {
  authStore.logout();
  closeMenu();
};

const closeMenuOnResize = () => {
  menuOpen.value = false;
};

watch(menuOpen, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add("overflow-hidden", "pr-[15px]");
  } else {
    document.documentElement.classList.remove("overflow-hidden", "pr-[15px]");
  }
});

onMounted(() => {
  window.addEventListener("resize", closeMenuOnResize);
});
</script>
