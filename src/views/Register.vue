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
          <h1 class="text-[24px] font-medium">Register To TenPin</h1>
        </div>
        <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
    <form @submit.prevent="register">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">First Name</label>
        <input
          v-model="form.firstName"
          type="text"
          class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        />
        <span v-if="v$.firstName.$error" class="text-red-500 text-sm">First Name is required</span>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Last Name</label>
        <input
          v-model="form.lastName"
          type="text"
          class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        />
        <span v-if="v$.lastName.$error" class="text-red-500 text-sm">Last Name is required</span>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Gender</label>
        <div class="flex space-x-4 mt-2">
          <label>
            <input v-model="form.gender" type="radio" value="M" class="accent-violet-500 mr-2" />
            Male
          </label>
          <label>
            <input v-model="form.gender" type="radio" value="F" class="accent-violet-500 mr-2" />
            Female
          </label>
        </div>
        <span v-if="v$.gender.$error" class="text-red-500 text-sm">Gender is required</span>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Email</label>
        <input v-model="form.email" type="email" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
        <span v-if="v$.email.$error" class="text-red-500 text-sm">Invalid email format</span>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        />
        <span v-if="v$.password.$error" class="text-red-500 text-sm">Password must be at least 6 characters</span>
      </div>
      <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <input v-model="form.confirmPassword" type="password" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
          <span v-if="v$.confirmPassword.$error" class="text-red-500 text-sm">Passwords must match</span>
        </div>
      <button
        type="submit"
        class="w-full h-[48px] bg-violet-500 text-white mt-2 mb-4 px-4 py-2 font-bold rounded-[8px] hover:bg-violet-700 cursor-pointer transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        Register
      </button>
    </form>
      <div class="flex items-center justify-center mt-5">
        <p class="mx-1">Already Have An Account?
          <router-link to="/login" class="text-violet-600 hover:underline">Log In</router-link>
        </p>
      </div>
    </div>
  </div>
  <div class="md:w-1/2 bg-[url(/images/register_bg.png)] bg-[#E3DCFF] bg-center bg-no-repeat min-h-screen"></div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, sameAs } from '@vuelidate/validators';
import type { Register } from '@/types/Register';

const router = useRouter();
const errorMessage = ref<string | null>(null);
const form = ref<Register & { confirmPassword: string }>({
  firstName: '',
  lastName: '',
  gender: 'M',
  email: '',
  password: '',
  confirmPassword: '',
});

const rules = computed(() => ({
  firstName: { required },
  lastName: { required },
  gender: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAs: sameAs(form.value.password) },
}));

const v$ = useVuelidate(rules, form);

async function register() {
  v$.value.$touch();
  errorMessage.value = null;

  if (v$.value.$invalid) {
    return;
  }

  const response = await useAuthStore().register(form.value);

  if (response) {
    router.push('/');
  } else {
    errorMessage.value = 'Registration failed. Please try again.';
  }
}
</script>
