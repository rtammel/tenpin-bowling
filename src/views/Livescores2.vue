<template>
  <div class="bowling-simulator">
    <h1>Vue 3 Two-Player Bowling Simulator</h1>

    <div v-if="!gameOver" class="status-indicator">
      <h2>Current Turn: {{ players[currentPlayerIndex]?.name }}</h2>
       <p>(Frame {{ currentFrameIndex + 1 }}, Roll {{ currentRollInFrame + 1 }})</p>
       <p>Next roll in {{ Math.ceil(timerCountdown / 1000) }}s...</p>
    </div>
     <div v-if="gameOver" class="game-over-message">
       <h2>Game Over!</h2>
        <p>{{ getWinnerText() }}</p>
    </div>

    <div v-for="(player, playerIdx) in players" :key="player.name" class="player-scorecard">
      <h3>{{ player.name }}</h3>
      <div class="scorecard">
        <table>
          <thead>
            <tr>
              <th v-for="frameNum in 10" :key="`header-${playerIdx}-${frameNum}`">
                {{ frameNum }}
              </th>
              <th>Total</th>
              <th>Max Possible</th>
            </tr>
          </thead>
          <tbody>
            <tr>
               <td v-for="(frame, frameIdx) in player.frames"
                   :key="`rolls-${playerIdx}-${frameIdx}`"
                   :class="{ 'current-frame': playerIdx === currentPlayerIndex && frameIdx === currentFrameIndex && !gameOver }">
                <div class="roll-boxes">
                  <span class="roll-box">{{ getRollDisplay(playerIdx, frameIdx, 0) }}</span>
                  <span class="roll-box">{{ getRollDisplay(playerIdx, frameIdx, 1) }}</span>
                  <span v-if="frameIdx === 9" class="roll-box">{{ getRollDisplay(playerIdx, frameIdx, 2) }}</span>
                </div>
              </td>
              <td rowspan="2" class="total-score final-cell">{{ player.totalScore }}</td>
              <td rowspan="2" class="max-score final-cell">{{ player.possibleMaxScore }}</td>
            </tr>
            <tr>
               <td v-for="(frame, frameIdx) in player.frames"
                   :key="`score-${playerIdx}-${frameIdx}`"
                   class="frame-score"
                   :class="{ 'current-frame': playerIdx === currentPlayerIndex && frameIdx === currentFrameIndex && !gameOver }">
                 {{ frame.displayScore ?? '' }}
                 </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <button @click="resetGame">Reset Game</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// --- Interfaces ---
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

// --- Constants ---
const MAX_GAMES = 6; // Each player plays 6 games
const FRAME_COUNT = 10;
const MAX_PINS = 10;
const PLAYER_COUNT = 2;
const ROLL_INTERVAL_MS = 2000; // 15 seconds

// --- Reactive State ---
const players = ref<Player[]>([]);
const currentGameRound = ref<number>(1); // Starts at game 1
const currentPlayerIndex = ref<number>(0); // 0 or 1
const currentFrameIndex = ref<number>(0); // Overall frame number (0-9)
const currentRollInFrame = ref<number>(0); // Roll within the current player's turn for the frame (0, 1, or 2)
const pinsRemaining = ref<number>(MAX_PINS);
const gameOver = ref<boolean>(false);

let rollInterval: number | null = null;
const timerCountdown = ref<number>(ROLL_INTERVAL_MS);
let countdownInterval: number | null = null;

// --- Initialization ---
const initializePlayers = () => {
  players.value = Array.from({ length: PLAYER_COUNT }, (_, i) => ({
    name: `Player ${i + 1}`,
    frames: Array.from({ length: FRAME_COUNT }, (_, frameIdx) => ({
        rolls: frameIdx === FRAME_COUNT - 1 ? [null, null, null] : [null, null],
        score: null,
        displayScore: ''
    })),
    totalScore: 0,
    possibleMaxScore: 300
  }));
};

/*const initializePlayers = () => {
  players.value = Array.from({ length: PLAYER_COUNT }, (_, i) => ({
    name: `Player ${i + 1}`,
    totalScore: players.value[i]?.totalScore || 0, // Preserve previous scores
    possibleMaxScore: 300,
    frames: Array.from({ length: FRAME_COUNT }, (_, frameIdx) => ({
        rolls: frameIdx === FRAME_COUNT - 1 ? [null, null, null] : [null, null], // Reset rolls
        score: null,
        displayScore: ''
    })),
  }));

  console.log("initializePlayers: Players array populated:", players.value);
};*/

// --- Game Logic ---
const recordRoll = (pinsKnocked: number) => {
  if (gameOver.value) return;

  const currentPlayer = players.value[currentPlayerIndex.value];
  const currentFrame = currentPlayer.frames[currentFrameIndex.value];

  // Ensure roll index is valid (especially for 10th frame)
  if (currentRollInFrame.value >= currentFrame.rolls.length) {
      console.error("Invalid roll index attempted.");
      return; // Avoid writing out of bounds
  }

  currentFrame.rolls[currentRollInFrame.value] = pinsKnocked;
  pinsRemaining.value -= pinsKnocked;

  // --- Determine if current player's turn for this frame is over ---
  let turnOver = false;
  const isTenthFrame = currentFrameIndex.value === FRAME_COUNT - 1;

  if (isTenthFrame) {
      turnOver = handleTenthFrameTurnLogic(pinsKnocked);
  } else {
      turnOver = handleRegularFrameTurnLogic(pinsKnocked);
  }

  // Calculate scores *after* recording the roll
  calculateAllScores(); // Recalculates for both players

  if (turnOver) {
    switchToNextPlayerOrFrame();
  } else {
    // Advance roll within the same player's turn
    currentRollInFrame.value++;
  }

  resetRollTimer(); // Reset timer after each roll/turn switch
};

// Determines if the turn ends for the current player in frames 1-9
const handleRegularFrameTurnLogic = (pinsKnocked: number): boolean => {
  const isStrike = currentRollInFrame.value === 0 && pinsKnocked === MAX_PINS;
  return isStrike || currentRollInFrame.value === 1; // Turn ends after strike or 2nd roll
};

// Determines if the turn ends for the current player in the 10th frame
const handleTenthFrameTurnLogic = (pinsKnocked: number): boolean => {
    const frame = players.value[currentPlayerIndex.value].frames[9];
    const roll = frame.rolls[0] ?? 0;

    if (currentRollInFrame.value === 0) {
        // First roll
        if (pinsKnocked === MAX_PINS) {
             pinsRemaining.value = MAX_PINS; // Reset for next roll (strike)
             return false; // Turn not over yet
        } else {
            // Didn't strike, move to 2nd roll
             return false; // Turn not over yet
        }
    } else if (currentRollInFrame.value === 1) {
        // Second roll
        const isSpare = roll + pinsKnocked === MAX_PINS;
        if (roll === MAX_PINS || isSpare) { // Got a strike on roll 1 or a spare on roll 2
            pinsRemaining.value = MAX_PINS; // Reset for 3rd roll
             return false; // Turn not over yet (need 3rd roll)
        } else {
            // Open frame after 2 rolls
            return true; // Turn is over
        }
    } else if (currentRollInFrame.value === 2) {
        // Third roll (only happens after strike/spare)
        return true; // Turn is always over after the 3rd roll
    }
    return false; // Default case, should not be reached
};


const switchToNextPlayerOrFrame = () => {
    const nextPlayerIndex = (currentPlayerIndex.value + 1) % PLAYER_COUNT;

    if (nextPlayerIndex === 0) {
        // Switching from Player 2 back to Player 1 means the frame number advances
        const nextFrameIndex = currentFrameIndex.value + 1;
        if (nextFrameIndex >= FRAME_COUNT) {
            // This was the final roll of the game (Player 2 finished 10th)
            endGame();
            return;
        } else {
            currentFrameIndex.value = nextFrameIndex;
        }
    }

    // Switch player
    currentPlayerIndex.value = nextPlayerIndex;
    currentRollInFrame.value = 0; // Reset roll count for the new player's turn
    pinsRemaining.value = MAX_PINS; // Reset pins for the new player

    // Check if the *new* current player has already finished their 10th frame (edge case)
    if (gameOver.value) {
         if (rollInterval) clearInterval(rollInterval);
         if (countdownInterval) clearInterval(countdownInterval);
    }
};


/*const endGame = () => {
  gameOver.value = true;
  if (rollInterval) clearInterval(rollInterval);
  if (countdownInterval) clearInterval(countdownInterval);
  rollInterval = null;
  countdownInterval = null;
  console.log("Game Over");
  // Final score calculation ensure max possible is capped at final score
  players.value.forEach(p => p.possibleMaxScore = p.totalScore);
};*/

const endGame = () => {
  console.log(`Game ${currentGameRound.value} is over!`);

  gameOver.value = true;
  if (rollInterval) clearInterval(rollInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  players.value.forEach(p => p.possibleMaxScore = p.totalScore);

  setTimeout(() => {
    if (currentGameRound.value < MAX_GAMES) {
      resetGame();
    } else {
      console.log("All 6 games completed! Final scores:");
      players.value.forEach(p => console.log(`${p.name}: ${p.totalScore} points`));
    }
  }, 3000); // Brief delay before starting next game
};

// --- Scoring Calculation ---
const calculateAllScores = () => {
    players.value.forEach((player, pIdx) => {
        let runningTotal = 0;
        for (let i = 0; i < FRAME_COUNT; i++) {
            const frameScore = calculateFrameScore(pIdx, i);
            player.frames[i].score = frameScore;

            if (frameScore !== null) {
                runningTotal += frameScore;
                player.frames[i].displayScore = runningTotal.toString();
            } else {
                 player.frames[i].displayScore = '';
                 // Stop display score propagation for this player if calculation incomplete
                  for (let j = i + 1; j < FRAME_COUNT; j++) {
                     player.frames[j].displayScore = '';
                  }
                  break; // Move to next player if score cannot be calculated yet
            }
        }
        player.totalScore = runningTotal;
        calculatePossibleMaxScore(pIdx); // Recalculate max possible for this player
    });
};

// Calculates score for a specific player and frame index
const calculateFrameScore = (playerIndex: number, frameIndex: number): number | null => {
  const playerFrames = players.value[playerIndex].frames;
  const frame = playerFrames[frameIndex];
  const roll1 = frame.rolls[0];
  const roll2 = frame.rolls[1];

  if (roll1 === null) return null;

  const isStrike = roll1 === MAX_PINS;
  const isSpare = roll1 + (roll2 ?? 0) === MAX_PINS && !isStrike;

  if (frameIndex === FRAME_COUNT - 1) {
    // 10th Frame Calculation
    const roll3 = frame.rolls[2];
     if (isStrike || isSpare) {
       if (roll2 === null || roll3 === null) return null; // Need all rolls if bonus earned
       return (roll1 ?? 0) + (roll2 ?? 0) + (roll3 ?? 0);
     } else {
        if (roll2 === null) return null; // Need second roll if open
        return (roll1 ?? 0) + (roll2 ?? 0);
     }
  } else {
    // Regular Frames (1-9)
    if (isStrike) {
      const bonusRolls = getNextRolls(playerIndex, frameIndex, 2);
      if (bonusRolls.length < 2) return null;
      return MAX_PINS + bonusRolls[0] + bonusRolls[1];
    } else if (isSpare) {
      if (roll2 === null) return null;
      const bonusRolls = getNextRolls(playerIndex, frameIndex, 1);
      if (bonusRolls.length < 1) return null;
      return MAX_PINS + bonusRolls[0];
    } else {
      if (roll2 === null) return null;
      return (roll1 ?? 0) + (roll2 ?? 0);
    }
  }
};

// Gets next N valid rolls for bonus calculation for a specific player
const getNextRolls = (playerIndex: number, currentFrameIndex: number, numberOfRolls: number): number[] => {
    const playerFrames = players.value[playerIndex].frames;
    const rolls: number[] = [];
    let frameIdx = currentFrameIndex + 1;
    let rollsFound = 0;

     while (frameIdx < FRAME_COUNT && rollsFound < numberOfRolls) {
        const nextFrame = playerFrames[frameIdx];
        // Roll 1
        if (nextFrame.rolls[0] !== null) {
            rolls.push(nextFrame.rolls[0]);
            rollsFound++;
            if (rollsFound === numberOfRolls) break;
        } else break; // Stop if roll not made

         // Roll 2 / Handling Strikes in next frame
         if (nextFrame.rolls[0] === MAX_PINS && frameIdx < FRAME_COUNT - 1) {
             // Strike in frame 1-9 needs next frame's first roll
             // Handled by next iteration of the while loop
         } else if (nextFrame.rolls[1] !== null) {
             rolls.push(nextFrame.rolls[1]);
             rollsFound++;
             if (rollsFound === numberOfRolls) break;
         } else if(frameIdx === FRAME_COUNT - 1) { // Check 10th frame's potential 2nd/3rd roll
              if (nextFrame.rolls[1] !== null) {
                  rolls.push(nextFrame.rolls[1]);
                  rollsFound++;
                  if (rollsFound === numberOfRolls) break;
              }
              if (nextFrame.rolls[2] !== null) {
                   rolls.push(nextFrame.rolls[2]);
                   rollsFound++;
                   if (rollsFound === numberOfRolls) break;
              }
         } else {
             // Break if roll 2 is needed but null (and wasn't a strike case)
              if (nextFrame.rolls[0] !== MAX_PINS) break;
         }
         frameIdx++;
    }
    return rolls.filter(r => typeof r === 'number') as number[];
};

// --- Possible Max Score Calculation ---
const calculatePossibleMaxScore = (playerIndex: number) => {
  console.log(`Calculating possible max score for player ${playerIndex}`);
    const player = players.value[playerIndex];
    if (gameOver.value) { // If game is globally over, max is current
        player.possibleMaxScore = player.totalScore;
        return;
    }

    // Create a deep copy of the specific player's frames to simulate
    const tempFrames: Frame[] = JSON.parse(JSON.stringify(player.frames));

    // Determine the starting point for simulation for *this* player
    let simFrameIdx = 0;
    let simRollIdx = 0;
    let simPinsRemaining = MAX_PINS; // Assume full pins for future rolls unless already mid-frame

     // Find the first incomplete roll for this player
     let foundStart = false;
     for (let f = 0; f < FRAME_COUNT; f++) {
         for (let r = 0; r < tempFrames[f].rolls.length; r++) {
             if (tempFrames[f].rolls[r] === null) {
                 simFrameIdx = f;
                 simRollIdx = r;
                 // Calculate remaining pins for this specific roll start point
                 if (r > 0 && f < FRAME_COUNT - 1) { // Not first roll, not 10th frame 3rd bonus
                     if (tempFrames[f].rolls[0] !== MAX_PINS) { // Not after a strike
                          simPinsRemaining = MAX_PINS - (tempFrames[f].rolls[0] ?? 0);
                     }
                 } else if (f === FRAME_COUNT -1) { // Special 10th frame pin logic
                      const r0 = tempFrames[f].rolls[0];
                      const r1 = tempFrames[f].rolls[1];
                      if (r === 1) { // Simulating 2nd roll
                          simPinsRemaining = (r0 === MAX_PINS) ? MAX_PINS : MAX_PINS - (r0 ?? 0);
                      } else if (r === 2) { // Simulating 3rd roll
                           const spareInPrev = (r0 ?? 0) + (r1 ?? 0) === MAX_PINS;
                           simPinsRemaining = (r1 === MAX_PINS || spareInPrev) ? MAX_PINS : MAX_PINS - (r1 ?? 0) ;
                      }
                 }
                 // If it's the very first roll of the game for this player (f=0, r=0) simPinsRemaining stays MAX_PINS

                 foundStart = true;
                 break;
             }
         }
         if (foundStart) break;
     }

     // If all rolls are filled (e.g., player has finished), max score is current score
      if (!foundStart && player.frames[9].rolls.every(r => r !== null)) {
          player.possibleMaxScore = player.totalScore;
          return;
      }
       if (!foundStart && player.frames[9].rolls[0] !== null && player.frames[9].rolls[1] !== null && !((player.frames[9].rolls[0]??0) === MAX_PINS || (player.frames[9].rolls[0]??0) + (player.frames[9].rolls[1]??0) === MAX_PINS)) {
            player.possibleMaxScore = player.totalScore;
          return; // Game ended for player - open 10th frame
       }


    // Fill remaining rolls simulation (from simFrameIdx, simRollIdx onwards)
    while(simFrameIdx < FRAME_COUNT) {
        const currentTempFrame = tempFrames[simFrameIdx];
         if (simRollIdx >= currentTempFrame.rolls.length) { // Should not happen if logic is right, but safety break
             simFrameIdx++;
             simRollIdx = 0;
             simPinsRemaining = MAX_PINS;
             continue;
         }

        const pinsToKnock = simPinsRemaining; // Assume knock down all remaining
        currentTempFrame.rolls[simRollIdx] = pinsToKnock;

        //--- Advance logic for simulation ---
        const isTenthFrame = simFrameIdx === FRAME_COUNT - 1;

        if(isTenthFrame) {
            //const roll1 = currentTempFrame.rolls[0] ?? 0;
             if (simRollIdx === 0) {
                 simPinsRemaining = MAX_PINS; // Always reset after first roll (assume strike for max)
                 simRollIdx++;
             } else if (simRollIdx === 1) {
                 simPinsRemaining = MAX_PINS; // Always reset after second roll (assume strike/spare for max)
                 simRollIdx++;
             } else if (simRollIdx === 2) {
                 simFrameIdx++; // End after 3rd roll
             }
        } else {
            // Regular frame simulation advance (assume strike)
             currentTempFrame.rolls[simRollIdx] = MAX_PINS; // Assume Strike
             if(simRollIdx === 0) { // Only fill first roll box for strike
                 simPinsRemaining = MAX_PINS;
                 simFrameIdx++;
                 simRollIdx = 0;
             } else {
                 // This case shouldn't be hit if we always assume strike on first roll
                  simPinsRemaining = MAX_PINS;
                  simFrameIdx++;
                  simRollIdx = 0;
             }
        }
    }

    // Calculate potential score based on the *filled* tempFrames
     let runningTotal = 0;
     for (let i = 0; i < FRAME_COUNT; i++) {
         const score = calculatePotentialFrameScore(tempFrames, i);
         if (score !== null) {
             runningTotal += score;
         } else {
             console.warn(`Could not calculate potential score for player ${playerIndex}, frame ${i}`);
              runningTotal = player.totalScore; // Fallback to current score if calculation fails mid-way
             break;
         }
     }

    player.possibleMaxScore = runningTotal;
};

// Uses the same helper as before, assuming filled frames
const calculatePotentialFrameScore = (framesData: Frame[], frameIndex: number): number | null => {
    const frame = framesData[frameIndex];
    // Use default 0 for null rolls in potential calculation as they should be filled
    const roll1 = frame.rolls[0] ?? 0;
    const roll2 = frame.rolls[1] ?? 0;
    const roll3 = frame.rolls[2] ?? 0; // Only for 10th

    const isStrike = roll1 === MAX_PINS;
    const isSpare = roll1 + roll2 === MAX_PINS && !isStrike;

    if (frameIndex === FRAME_COUNT - 1) {
        return roll1 + roll2 + roll3;
    }

    if (isStrike) {
        const bonus = getPotentialNextRolls(framesData, frameIndex, 2);
        // Check if bonus rolls are actually numbers (might be null if lookahead failed)
        if (typeof bonus[0] !== 'number' || typeof bonus[1] !== 'number') return null;
        return MAX_PINS + bonus[0] + bonus[1];
    } else if (isSpare) {
        const bonus = getPotentialNextRolls(framesData, frameIndex, 1);
         if (typeof bonus[0] !== 'number') return null;
        return MAX_PINS + bonus[0];
    } else {
        return roll1 + roll2;
    }
};

const getPotentialNextRolls = (framesData: Frame[], currentFrameIndex: number, numberOfRolls: number): number[] => {
    const rolls: number[] = [];
    let frameIdx = currentFrameIndex + 1;
    let rollsFound = 0;

    while (frameIdx < FRAME_COUNT && rollsFound < numberOfRolls) {
        const nextFrame = framesData[frameIdx];
        const r1 = nextFrame.rolls[0] ?? 0; // Default to 0 if null
        rolls.push(r1);
        rollsFound++;
        if (rollsFound === numberOfRolls) break;

        if (r1 !== MAX_PINS || frameIdx === FRAME_COUNT - 1) {
             const r2 = nextFrame.rolls[1] ?? 0;
             rolls.push(r2);
             rollsFound++;
             if (rollsFound === numberOfRolls) break;
             if (frameIdx === FRAME_COUNT -1) {
                  const r3 = nextFrame.rolls[2] ?? 0;
                  rolls.push(r3);
                  rollsFound++;
                  if (rollsFound === numberOfRolls) break;
             }
        }
        frameIdx++;
    }
     // Pad with 0s if needed, though max potential should always have values
    while (rolls.length < numberOfRolls) {
        rolls.push(0);
    }
    return rolls.slice(0, numberOfRolls);
};

// --- UI Display Helpers ---
const getRollDisplay = (playerIndex: number, frameIndex: number, rollIndexInFrame: number): string => {
  const frame = players.value[playerIndex]?.frames[frameIndex];
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

const getWinnerText = (): string => {
    if (!gameOver.value) return "";
    const p1Score = players.value[0]?.totalScore ?? 0;
    const p2Score = players.value[1]?.totalScore ?? 0;
    if (p1Score > p2Score) return `${players.value[0].name} wins! (${p1Score} - ${p2Score})`;
    if (p2Score > p1Score) return `${players.value[1].name} wins! (${p2Score} - ${p1Score})`;
    return `It's a tie! (${p1Score} - ${p2Score})`;
}


// --- Simulation ---
const simulateRoll = () => {
  if (gameOver.value) return;

  const maxPinsForRoll = pinsRemaining.value;
  const pinsKnocked = Math.floor(Math.random() * (maxPinsForRoll + 1));
  console.log(`Simulating Roll: ${players.value[currentPlayerIndex.value].name}, Frame ${currentFrameIndex.value + 1}, Roll ${currentRollInFrame.value + 1}, Pins: ${pinsRemaining.value} -> Hit: ${pinsKnocked}`);
  recordRoll(pinsKnocked);
};

/*const simulateRoll = () => {
  if (gameOver.value) return;

  if (!players.value || players.value.length === 0) {
    console.error("simulateRoll: Players array is empty—forcing re-initialization.");
    initializePlayers();

    // Check again after re-initialization
    if (players.value.length === 0) {
      console.error("simulateRoll: Players still not initialized—aborting roll!");
      return;
    }
  }

  const currentPlayer = players.value[currentPlayerIndex.value];

  if (!currentPlayer) {
    console.error(`simulateRoll: No player found at index ${currentPlayerIndex.value}`);
    return;
  }

  const maxPinsForRoll = pinsRemaining.value;
  const pinsKnocked = Math.floor(Math.random() * (maxPinsForRoll + 1));

  console.log(`Simulating Roll: ${currentPlayer.name}, Frame ${currentFrameIndex.value + 1}, Roll ${currentRollInFrame.value + 1}, Pins: ${pinsRemaining.value} -> Hit: ${pinsKnocked}`);

  recordRoll(pinsKnocked);
};*/

const startSimulation = () => {
  if (rollInterval) clearInterval(rollInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  timerCountdown.value = ROLL_INTERVAL_MS;

  rollInterval = setInterval(simulateRoll, ROLL_INTERVAL_MS);

  countdownInterval = setInterval(() => {
     timerCountdown.value -= 100;
      if(timerCountdown.value <= 0) {
          // Check if game is over before resetting countdown
          if(!gameOver.value) {
            timerCountdown.value = ROLL_INTERVAL_MS;
          } else {
             if(countdownInterval) clearInterval(countdownInterval); // Stop countdown if game over
          }
      }
       // Ensure countdown doesn't go negative if interval clears slightly late
      if (timerCountdown.value < 0) timerCountdown.value = 0;
  }, 100);
};

const resetRollTimer = () => {
    if (gameOver.value) {
        if (rollInterval) clearInterval(rollInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        return;
    }
    if (rollInterval) clearInterval(rollInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    startSimulation();
}

/*const resetGame = () => {
  console.log("Resetting game...");
  gameOver.value = false;
  currentPlayerIndex.value = 0;
  currentFrameIndex.value = 0;
  currentRollInFrame.value = 0;
  pinsRemaining.value = MAX_PINS;
  initializePlayers(); // Re-initializes players and their scores/frames
  calculateAllScores(); // Calculate initial scores (should be 0)
  resetRollTimer(); // Start simulation timer again
};*/

const resetGame = () => {
  if (currentGameRound.value >= MAX_GAMES) {
    console.log("Maximum games reached. No further resets.");
    return;
  }

  console.log(`Starting Game ${currentGameRound.value + 1}...`);

  gameOver.value = false;
  currentPlayerIndex.value = 0;
  currentFrameIndex.value = 0;
  currentRollInFrame.value = 0;
  pinsRemaining.value = MAX_PINS;

  initializePlayers(); // Resets frames properly while keeping scores
  calculateAllScores();
  resetRollTimer();
  currentGameRound.value++;
};

// --- Lifecycle Hooks ---
onMounted(() => {
  initializePlayers();
  startSimulation();
});

onUnmounted(() => {
  if (rollInterval) clearInterval(rollInterval);
  if (countdownInterval) clearInterval(countdownInterval);
  console.log("Bowling component unmounted, intervals cleared.");
});

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
