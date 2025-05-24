<template>
  <div class="flex justify-center items-center pl-[16px] md:pl-[40px] border-l-[1px] border-gray-200">
    <div class="flex justify-center items-center w-[60px] h-[60px] rounded-full border-[6px] border-solid" :class="circleStyle">
      <strong class="text-[18px]">{{ squad.registered_players }}</strong>
      <span class="text-[12px] text-gray-500">/{{ squad.max_players }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ squad: { registered_players: number; max_players: number } }>();

const occupationPercentage = computed(() => {
  return (props.squad.registered_players / props.squad.max_players) * 100;
});

const circleStyle = computed(() => {
  let color = 'border-green-500'; // Green (Low Occupation)

  if (occupationPercentage.value >= 70) {
    color = 'border-red-500'; // Red (Full)
  } else if (occupationPercentage.value >= 40) {
    color = 'border-yellow-500'; // Yellow (Moderate)
  }

  return color;
});
</script>
