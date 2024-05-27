import {Gpio} from "onoff";
import recorder from 'node-record-lpcm16';
import tf from '@tensorflow/tfjs-node';
import speechCommands from '@tensorflow-models/speech-commands';
import fs from "fs"

import {LINE_NUMBERS} from "../GPIO/LINE_NUMBERS.js"


// GPIO setup
const LED_PIN = 16
const led = new Gpio(LINE_NUMBERS["SIXTEEN"], 'out');

// Function to switch on the LED
const switchOnLed = () => {
  led.writeSync(1);
  console.log('LED switched on');
};

// Function to switch off the LED
const switchOffLed = () => {
  led.writeSync(0);
  console.log('LED switched off');
};

// Speech recognition setup
const MODEL_PATH = 'https://storage.googleapis.com/tfjs-speech-model/18w/';

// Load the Speech Command Recognizer model
async function loadModel() {
  const recognizer = speechCommands.create('BROWSER_FFT');
  await recognizer.ensureModelLoaded();
  return recognizer;
}

// Start listening for voice commands
async function startListening(recognizer) {
  recognizer.listen(({ scores }) => {
    const words = recognizer.wordLabels();
    const score = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }))
      .sort((a, b) => b.score - a.score)[0];
      
    if (score.word === 'switch on the led' && score.score > 0.5) {
      switchOnLed();
    } else if (score.word === 'switch off the led' && score.score > 0.5) {
      switchOffLed();
    }

    console.log(`Heard: ${score.word}, Score: ${score.score}`);
  }, {
    probabilityThreshold: 0.75
  });

  // Stop the listening after 10 seconds
  setTimeout(() => recognizer.stopListening(), 10000);
}

// Main function to run the program
export async function aiLedMicrophone() {
  const recognizer = await loadModel();


const file = fs.createWriteStream('record.wav', { encoding: 'binary' })

  // Record audio using the Bluetooth microphone
  const recording = recorder.record({
    recorder: 'arecord',
    sampleRateHertz: 16000,
    threshold: 0.5,
    verbose: true,
    recordProgram: 'rec', // or 'sox'
    // device: 'plughw:1,0' // Adjust this based on your device
  })
  .stream()
  .on("error", console.error)
  .pipe(file)


  const data = await fs.readFile('record.wav', async (error, data) => {
      recognizer.processAudio(data.buffer)
      await startListening(recognizer);

  });

}

// main().catch(console.error);
