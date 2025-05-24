<template>
  <div class="flex min-h-screen">
    <div class="w-full md:w-1/2 flex items-center bg-white">
      <div class="w-full max-w-xl mx-auto px-8 py-15">
        <div class="flex items-center justify-center">
          <router-link to="/">
            <img src="/images/logo.svg" alt="Ten Pin" />
          </router-link>
        </div>
        <div class="text-center my-5">
          <h1 class="text-[24px] font-medium">Log In To TenPin</h1>
        </div>
        <p v-if="errorMessage" class="mb-4 text-red-500">{{ errorMessage }}</p>
        <form @submit.prevent="login">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <input id="email" v-model="form.email" type="email" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
            <span v-if="v$.email.$error" class="text-red-500 text-sm">Invalid email format</span>
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            />
            <span v-if="v$.password.$error" class="text-red-500 text-sm">Password must be at least 6 characters</span>
          </div>
          <button
            type="submit"
            class="w-full h-[48px] bg-violet-500 text-white mt-2 mb-4 px-4 py-2 font-bold rounded-[8px] hover:bg-violet-700 cursor-pointer transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            Log In
          </button>
        </form>
        <div class="flex items-center justify-center mt-5">
          <p class="mx-1">
            Don't Have An Account?
            <router-link to="/register" class="text-violet-600 hover:underline">Register Now</router-link>
          </p>
        </div>
      </div>
    </div>
    <div class="md:w-1/2 bg-[url(/images/login_bg.png)] bg-[#E3DCFF] bg-center bg-[length:1000px] bg-no-repeat min-h-screen">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import type { Login } from '@/types/Login';

const router = useRouter();
const route = useRoute();
const errorMessage = ref<string | null>(null);
const form = ref<Login>({
  email: '',
  password: '',
});

const rules = computed(() => ({
  email: { required, email },
  password: { required, minLength: minLength(6) },
}));

const v$ = useVuelidate(rules, form);

async function login() {
  v$.value.$touch();
  errorMessage.value = null;

  if (v$.value.$invalid) {
    return;
  }

  const response = await useAuthStore().login(form.value);
  if (response) {
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  } else {
    errorMessage.value = 'Invalid email or password. Please try again.';
  }
}
</script>
