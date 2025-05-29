<template>
  <div class="my-[80px] px-[16px] md:px-10 ml:px-16 py-[16px] ml:pt-20 ml:pb-[72px]">
    <div class="max-w-[1312px] mx-auto bg-white rounded-[24px] md:rounded-[30px] p-[16px] md:p-[24px] border border-slate-200 shadow-xs">
      <div v-if="user" class="lg:w-[600px] mx-auto lg:my-[24px]">
        <h1 class="text-[28px] text-bold mb-6 lg:mb-8">Edit Profile</h1>
        <form @submit.prevent="updateUserProfile">
          <div>
            <div class="flex flex-col md:flex-row md:gap-4 w-full md:mb-4">
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">First Name:</label>
                <input v-model="user.first_name" required class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"/>
              </div>
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">Last Name:</label>
                <input v-model="user.last_name" required class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
              </div>
            </div>
            <div class="flex flex-col md:flex-row md:gap-4 w-full md:mb-4">
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">Email:</label>
                <input v-model="user.email" type="email" disabled class="w-full border bg-gray-100 border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
              </div>
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">Birthday:</label>
                <input v-model="user.birthday" type="date" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400" />
              </div>
            </div>
            <div class="flex flex-col md:flex-row md:gap-4 w-full md:mb-4">
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">Gender:</label>
                <select v-model="user.gender"  class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div class="mb-4 w-full">
                <label class="block text-sm font-medium mb-1">Club Name:</label>
                <input v-model="user.clubname" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"/>
              </div>
            </div>
            <div class="flex flex-col md:flex-row md:gap-4 w-full md:mb-4">
              <div class="mb-4 w-full">
                <label>Country:</label>
                <select v-model="user.country">
                  <option v-for="country in countries" :key="country.code" :value="country.name">
                    {{ country.name }}
                  </option>
                </select>
              </div>
              <div class="mb-4 w-full">
                <label>Phone Number:</label>
                <input v-model="user.phonenumber" type="tel" class="w-full border border-gray-300 hover:border-gray-400 rounded-[8px] px-3 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"/>
              </div>
            </div>
            <h2 class="test-[20px] font-bold mb-4">Profile Picture</h2>
            <div class="flex items-center mb-4">
              <img v-if="user?.profilepicture" :src="user.profilepicture" :alt="`${user.first_name} ${user.last_name}`" class="rounded-full w-[120px] h-[120px]" />
              <img v-if="previewImage" :src="previewImage" :alt="`${user.first_name} ${user.last_name}`" class="preview-img" />
              <input type="file" @change="handleFileUpload" accept="image/*" />
            </div>
            <button type="submit" class="w-full h-[48px] bg-violet-500 text-white mt-2 mb-4 px-4 py-2 font-bold rounded-[8px] hover:bg-violet-700 cursor-pointer transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">Save Changes</button>
          </div>
        </form>
      </div>
      <p v-else>Loading profile...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { User } from "@/types/User";
import { countries } from "../utils/countries";
const selectedFile = ref<File | null>(null);
const previewImage = ref<string | null>(null);
//import axios from "axios";
import { formatFormDate } from "@/utils/formatDate";
import UserService from "@/services/UserService";

const user = ref<User | null>(null);
const userService = new UserService();

const fetchUserProfile = async () => {
  try {
    user.value = await userService.getProfile();
    if (user.value && user.value.birthday) {
      user.value.birthday = formatFormDate(user.value.birthday);
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const updateUserProfile = async () => {
  if (!user.value) return;

  const formData = new FormData();
  formData.append("first_name", user.value.first_name);
  formData.append("last_name", user.value.last_name);
  formData.append("gender", user.value.gender);
  formData.append("birthday", user.value.birthday || "");
  formData.append("country", user.value.country || "");
  formData.append("phonenumber", user.value.phonenumber || "");
  formData.append("clubname", user.value.clubname || "");

  if (user.value.hand) {
    formData.append("hand", user.value.hand);
  }

  if (selectedFile.value) {
    formData.append("profilepicture", selectedFile.value);
  }

  try {
    /*const res = await axios.put(`http://localhost:3000/api/users/profile`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });*/
    //const res = await userService.updateProfile(formData);
    user.value = await userService.updateProfile(formData);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};

onMounted(fetchUserProfile);
</script>
