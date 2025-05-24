<template>
  <div id="map" class="w-full h-[300px] md:h-[400px]"></div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropType } from 'vue';

const props = defineProps({
  latitude: {
    type: Number as PropType<number>,
    required: true
  },
  longitude: {
    type: Number as PropType<number>,
    required: true
  },
  tooltipText: {
    type: String as PropType<string>,
    default: 'Marker Location'
  }
});

let map: L.Map | null = null;

onMounted(() => {
  map = L.map('map').setView([props.latitude, props.longitude], 17);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  addMarker(props.latitude, props.longitude, props.tooltipText);
});

watch(
  (): [number, number, string] => [props.latitude, props.longitude, props.tooltipText],
  ([newLatitude, newLongitude, newTooltipText]) => {
    if (map && newLatitude !== undefined && newLongitude !== undefined) {
      map.setView([newLatitude, newLongitude], map.getZoom());
      map.eachLayer((layer) => {
        if (map) {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        }
      });
      addMarker(newLatitude, newLongitude, newTooltipText);
    }
  }
);

const addMarker = (lat: number, lng: number, text: string) => {
  if (map) {
    L.marker([lat, lng])
      .addTo(map)
      .bindTooltip(text, {
        permanent: false,
        direction: 'top',
        offset: [-16, -20]
      });
  }
};
</script>
