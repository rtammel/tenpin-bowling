<template>
  <div>
    <h1>Bowling Scorecard</h1>
    <label>Handicap Score: <input v-model.number="hdcp" type="number" min="0"></label>
    <input v-model.number="pins" type="number" min="0" max="10" @keyup.enter="roll" placeholder="Enter pins knocked">
    <button @click="roll">Roll</button>
    <p>Current Frame: {{ currentFrame + 1 }}</p>
    <p>Final Score: {{ score }}</p>
    <p>Total Hdcp Score: {{ hdcpTotalScore }}</p>
    <p>Possible Max Score: {{ possibleMaxScore }}</p>

    <div>
      <h2>Frames</h2>
      <div v-for="(frame, index) in frames" :key="index">
        Frame {{ index + 1 }}:
        <span v-for="(pins, i) in frame.rolls" :key="i">
          {{ formatRoll(pins, frame.rolls, i) }}
        </span>
        <span v-if="showFrameScore(index)"> → {{ frameMaxScores[index] }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';

interface Frame {
  rolls: number[];
}

export default {
  setup() {
    const frames = ref<Frame[]>(Array.from({ length: 10 }, () => ({ rolls: [] })));
    const currentFrame = ref<number>(0);
    const pins = ref<number | null>(null);
    const hdcp = ref<number>(0); // Handicap score input

    const roll = () => {
      if (currentFrame.value < 10 && pins.value !== null) {
        frames.value[currentFrame.value].rolls.push(pins.value);

        if (currentFrame.value < 9) {
          if (frames.value[currentFrame.value].rolls.length === 2 || frames.value[currentFrame.value].rolls.reduce((a, b) => a + b, 0) >= 10) {
            currentFrame.value++;
          }
        } else {
          if ((frames.value[9].rolls.length === 2 && frames.value[9].rolls[0] + frames.value[9].rolls[1] < 10) || frames.value[9].rolls.length === 3) {
            currentFrame.value++;
          }
        }
        pins.value = null;
      }
    };

    const formatRoll = (pins: number, frame: number[], i: number): string => {
      if (pins === 10 && i === 0) return "X"; // Strike
      if (i === 1 && frame[0] + pins === 10) return "/"; // Spare
      if (pins === 0) return "-"; // Miss
      return pins.toString();
    };

    const score = computed(() => {
      let total = 0;
      frames.value.forEach((frame, i) => {
        total += frame.rolls.reduce((a, b) => a + b, 0);

        if (i < 9) {
          if (frame.rolls.length === 1 && frame.rolls[0] === 10) { // Strike
            total += (frames.value[i + 1]?.rolls[0] || 0) + (frames.value[i + 1]?.rolls[1] || frames.value[i + 2]?.rolls[0] || 0);
          } else if (frame.rolls.length === 2 && frame.rolls.reduce((a, b) => a + b, 0) === 10) { // Spare
            total += frames.value[i + 1]?.rolls[0] || 0;
          }
        }
      });
      return total;
    });

    const possibleMaxScore = computed(() => {
      return frames.value[0]?.rolls[0] === 10 ? 300 : score.value + (10 - currentFrame.value) * 30;
    });

    const hdcpTotalScore = computed(() => {
      return score.value + hdcp.value;
    });

    const frameMaxScores = computed(() => {
  return frames.value.map((frame, i) => {
    if (i < 9) {
      // If the frame has a strike, wait for two more rolls before showing score
      if (frame.rolls.length === 1 && frame.rolls[0] === 10) {
        if (frames.value[i + 1]?.rolls[0] === 10 && frames.value[i + 2]?.rolls[0] === 10) {
          return 30; // After 3 strikes, the first frame gets 30 points
        }
        return null; // Otherwise, score remains hidden
      }

      // If the previous frame was a strike, check for proper cascading bonus points
      if (i > 0 && frames.value[i - 1]?.rolls[0] === 10) {
        if (frames.value[i]?.rolls[0] === 10 && frames.value[i + 1]?.rolls[0] === 10) {
          return 60; // Second frame confirmed with cascading strike bonus
        }
      }

      // If the frame is fully completed, compute its score
      if (frame.rolls.length === 2 || frame.rolls[0] === 10) {
        let score = frame.rolls.reduce((a, b) => a + b, 0);
        if (score === 10 && frame.rolls.length === 2) {
          score += frames.value[i + 1]?.rolls[0] || 0; // Spare bonus
        }
        return score;
      }

      return null;
    } else {
      // Special handling for the final frame, where scoring happens immediately
      return frame.rolls.length === 3 ? frame.rolls.reduce((a, b) => a + b, 0) : null;
    }
  });
});

    const showFrameScore = (index: number): boolean => {
      return frameMaxScores.value[index] !== null;
    };

    return { frames, currentFrame, pins, hdcp, roll, score, possibleMaxScore, hdcpTotalScore, frameMaxScores, showFrameScore, formatRoll };
  }
};
</script>

<style scoped>
input {
  margin-right: 10px;
}
</style>
