<template>
  <div>
    <h1>Bowling Game - ID {{ gameState?.gameId || "Loading..." }}</h1>
    <div>
      <ul>
        <li class="bg-black/20 rounded-t-md relative">
          <div class="origin-top-left" style="transform: scale(1.325); width: 623.899px;">
            <p class="pl-2">Lane 34</p>
            <p class="text-base text-secondary absolute top-px right-2">Team 34</p>
            <section style="font-family: Inter, sans-serif, sans-serif; background-color: rgb(45, 68, 56);" v-for="(player, playerIdx) in gameState?.players" :key="player.name">
              <div class="flex justify-between px-2 py-1/2 items-baseline">
                <p class="uppercase" style="color: rgb(67, 215, 103); font-family: Inter, sans-serif, sans-serif; font-size: 20px; font-weight: bold; font-style: normal;">{{ player.name }}</p>
                <p style="font-size: 16px; font-family: Inter, sans-serif, sans-serif; color: rgb(179, 206, 179); font-weight: bold;">Game 1</p>
              </div>
              <div class="flex">
                <ul class="list-none m-0 p-0 flex flex-1" style="background-color: rgb(255, 255, 255);">
                  <li class="text-center flex relative flex-col" :style="frameIdx !== 9 ? { flex: '1 1 0%' } : { flex: '1.5 1 0%' }" v-for="(frame, frameIdx) in player.frames" :key="`rolls-${playerIdx}-${frameIdx}`">
                    <div v-if="frameIdx !== 9" class="flex justify-center items-center min-h-[27px]" style="color: rgb(0, 0, 0); font-size: 16px; font-weight: bold;">
                      <div class="relative flex-1 h-full flex justify-center items-center ">{{ getRollDisplay(playerIdx, frameIdx, 0) }}</div>
                      <div class="relative flex-1 h-full flex justify-center items-center">{{ getRollDisplay(playerIdx, frameIdx, 1) }}</div>
                    </div>
                    <div v-if="frameIdx !== 9" class="text-center h-full box-border min-h-[30px]" style="color: rgb(0, 0, 0); font-size: 20px; font-weight: bold;">{{ frame.displayScore }}</div>
                    <div v-if="frameIdx !== 9" class="h-full z-10 absolute right-0" style="width: 2px; background-color: rgb(45, 68, 56);"></div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex !== 9" class="flex justify-center items-center h-full w-full" style="color: gray; font-size: 20px; font-weight: bold; line-height: 20px;">Max</div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex !== 9" class="text-center h-full box-border min-h-[30px]" style="color: gray; font-size: 20px; font-weight: bold;">{{ player.possibleMaxScore }}</div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex !== 9" class="h-full z-10 absolute right-0" style="width: 2px; background-color: rgb(45, 68, 56);"></div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex === 9 && gameState?.currentPlayerIndex === playerIdx" class="flex justify-center items-center min-h-[27px]" style="color: rgb(0, 0, 0); font-size: 16px; font-weight: bold;">
                      <div class="relative flex-1 h-full flex justify-center items-center">{{ getRollDisplay(playerIdx, frameIdx, 0) }}</div>
                      <div class="relative flex-1 h-full flex justify-center items-center">{{ getRollDisplay(playerIdx, frameIdx, 1) }}</div>
                      <div class="relative flex-1 h-full flex justify-center items-center">{{ getRollDisplay(playerIdx, frameIdx, 2) }}</div>
                    </div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex === 9 && gameState?.currentPlayerIndex === playerIdx" class="text-center h-full box-border min-h-[30px]" style="color: rgb(0, 0, 0); font-size: 20px; font-weight: bold;">{{ frame.displayScore }}</div>
                    <div v-if="frameIdx === 9 && gameState?.currentFrameIndex === 9 && gameState?.currentPlayerIndex === playerIdx" class="h-full z-10 absolute right-0" style="width: 2px; background-color: rgb(45, 68, 56);"></div>
                  </li>
                </ul>
                <div class="text-center text-uppercase min-w-[76px] min-h-[42px] flex flex-col justify-around leading-none" style="background-color: rgb(67, 215, 103);">
                  <h3 class="m-0" style="color: rgb(0, 0, 0); font-family: Inter, sans-serif, sans-serif; font-size: 28px; font-weight: bold;">{{ player.totalScore }}</h3>
                </div>
              </div>
            </section>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

let ws: WebSocket | null = null;

interface Frame {
  rolls: (number | null)[];
  score: number | null;
  displayScore: string;
}

interface Player {
    name: string;
    frames: Frame[];
    totalScore: number;
    possibleMaxScore: number;
}

interface GameState {
    gameId: string;
    players: Player[];
    currentPlayerIndex: number;
    currentFrameIndex: number;
    currentRollInFrame: number;
    pinsRemaining: number;
    gameOver: boolean;
    isGameInitialized: boolean;
    winnerMessage: string;
    error?: string; // Optional error message
}

const route = useRoute();
const id = route.params.id;
const MAX_PINS = 10; // Maximum pins in a frame
const gameState = ref<GameState>();

console.log("WebSocket ID:", id);

onMounted(() => {
    ws = new WebSocket("ws://localhost:8080"); // Connect to your WebSocket server

    ws.onopen = () => {
        ws?.send(JSON.stringify({ id })); // Send ID from route
    };

    ws.onmessage = (event) => {
        console.log("Received message:", event.data);
        gameState.value = JSON.parse(event.data);
        console.log(gameState.value?.players[0].name);
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
});

onUnmounted(() => {
    ws?.close(); // Clean up the WebSocket connection when the component is unmounted
});

// --- UI Display Helpers ---
const getRollDisplay = (playerIndex: number, frameIndex: number, rollIndexInFrame: number): string => {
  const frame = gameState.value?.players[playerIndex]?.frames[frameIndex];
  if (!frame) return ''; // Player/frame not initialized yet
  const pins = frame.rolls[rollIndexInFrame];

  if (pins === null || pins === undefined) return '';

  if (frameIndex === 9) {
      // 10th Frame Display Logic
      const roll1 = frame.rolls[0];
      const roll2 = frame.rolls[1];
      if (rollIndexInFrame === 0) {
          return pins === MAX_PINS ? 'X' : pins.toString();
      } else if (rollIndexInFrame === 1) {
          if (roll1 === MAX_PINS) return pins === MAX_PINS ? 'X' : (pins === 0 ? '-' : pins.toString());
          if ((roll1 ?? 0) + pins === MAX_PINS) return '/';
          return pins === 0 ? '-' : pins.toString();
      } else { // Roll 3
          if (roll1 === MAX_PINS || (roll1 ?? 0) + (roll2 ?? 0) >= MAX_PINS) { // Earned 3rd roll
               if (roll1 === MAX_PINS && roll2 === MAX_PINS) return pins === MAX_PINS ? 'X' : (pins === 0 ? '-' : pins.toString()); // 1st&2nd strike
               if (roll1 !== MAX_PINS && (roll1 ?? 0) + (roll2 ?? 0) === MAX_PINS ) return pins === MAX_PINS ? 'X' : (pins === 0 ? '-' : pins.toString()); // Spare
               if (roll1 === MAX_PINS && roll2 !== MAX_PINS) return pins === MAX_PINS ? 'X' : ((roll2 ?? 0) + pins === MAX_PINS ? '/' : (pins === 0 ? '-' : pins.toString())); // Strike then non-strike

               return pins === MAX_PINS ? 'X' : (pins === 0 ? '-' : pins.toString()); // Default for 3rd earned roll
          } else {
               return ''; // No third roll earned
          }
      }
  } else {
      // Frames 1-9 Display Logic
      if (rollIndexInFrame === 0) {
          return pins === MAX_PINS ? 'X' : pins.toString();
      } else {
          const firstRollPins = frame.rolls[0];
          if (firstRollPins === MAX_PINS) return ''; // Strike - empty 2nd box
          if ((firstRollPins ?? 0) + pins === MAX_PINS) return '/'; // Spare
          return pins === 0 ? '-' : pins.toString(); // Open or miss
      }
  }
};
</script>

<style scoped>
.bowling-simulator {
  font-family: sans-serif;
  padding: 20px;
  background-color: #f4f4f4; /* Slightly lighter background */
  border-radius: 8px;
  max-width: 950px;
  margin: 20px auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: #2c3e50; /* Darker blue */
  margin-bottom: 15px;
}

.status-indicator {
    text-align: center;
    margin-bottom: 25px;
    padding: 10px;
    background-color: #e8f5e9; /* Light green background */
    border-radius: 4px;
    border-left: 5px solid #4CAF50; /* Green accent */
}
.status-indicator h2 {
    margin: 0 0 5px 0;
    color: #1b5e20; /* Dark green */
}
.status-indicator p {
    margin: 2px 0;
    color: #333;
    font-size: 0.9em;
}

.game-over-message {
    text-align: center;
    margin-bottom: 25px;
    padding: 15px;
    background-color: #ffebee; /* Light red background */
    border-radius: 4px;
    border-left: 5px solid #d32f2f; /* Red accent */
}
.game-over-message h2 {
     margin: 0 0 8px 0;
     color: #b71c1c; /* Dark red */
}
 .game-over-message p {
     margin: 0;
     font-size: 1.1em;
     font-weight: bold;
     color: #c62828;
 }

.player-scorecard {
  margin-bottom: 30px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  background-color: #fff;
}
.player-scorecard h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #34495e; /* Another shade of blue/grey */
    text-align: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}


.scorecard {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th, td {
  border: 1px solid #ccc;
  text-align: center;
  padding: 0; /* Remove padding, rely on inner elements */
  height: 48px; /* Slightly taller */
  font-size: 0.9rem;
  position: relative;
}

th {
  background-color: #ecf0f1; /* Lighter grey */
  font-weight: bold;
  padding: 8px 0; /* Re-add padding specific to header */
  color: #333;
}

td {
   vertical-align: top; /* Align roll boxes to top */
}

.roll-boxes {
  display: flex;
  height: 50%; /* Top half for rolls */
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 1px dotted #eee; /* Separator line */
}

.roll-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px dotted #eee;
  font-size: 0.85rem;
  min-width: 18px;
}
.roll-box:last-child {
  border-right: none;
}

td:nth-child(10) .roll-box { /* 10th frame */
   flex-basis: 33.33%;
}

.frame-score {
  font-size: 1.1rem;
  font-weight: bold;
  height: 35px; /* Different height for score row */
}

.total-score, .max-score {
   font-size: 1.3rem;
   font-weight: bold;
   vertical-align: middle; /* Center vertically */
}

.final-cell {
    background-color: #f9f9f9;
}


/* Highlighting */
td.current-frame { /* Target the TD directly for background */
  background-color: #fff9c4; /* Light yellow highlight */
  /* box-shadow: inset 0 0 6px rgba(255, 235, 59, 0.6); Subtle yellow glow */
}
/* Add border to inner elements to avoid affecting TD background */
.current-frame .roll-boxes, .current-frame .frame-score {
   /* Optionally add specific styles for highlighted elements if needed */
}


button {
    display: block;
    margin: 25px auto 0;
    padding: 12px 25px;
    font-size: 1.1rem;
    cursor: pointer;
    background-color: #3498db; /* Blue button */
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
     box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button:hover {
    background-color: #2980b9; /* Darker blue */
     box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Responsive adjustments remain similar */
@media (max-width: 768px) { /* etc. */ }
@media (max-width: 600px) { /* etc. */ }

</style>
