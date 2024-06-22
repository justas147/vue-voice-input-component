<script setup lang="ts">
import { ref } from 'vue'
import { uploadAudioToAPI } from '../composables/uploader'
import { mediaRecorderWrapper } from '../composables/recorderWrapper'

const props = defineProps({
  text: { type: String, default: 'Start Recording' },
  maxDuration: { type: Number, default: 5000, required: false },
  color: { type: String, default: '#1b1b32', required: false },
  apiEndpoint: { type: String, required: true },
  token: { type: String, required: false },
  formDataTag: { type: String, default: 'audio', required: false }
});

const emits = defineEmits(['transcription'])

const { 
  prepareRecording, 
  startRecording, 
  stopRecording, 
  getAudioBlob, 
  isRecording 
} = mediaRecorderWrapper()

async function startRec() {
  console.log('recording started')

  const constraints = {
    video: false,
    audio: {
      channelCount: 1,
      echoCancellation: false,
    },
  };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      prepareRecording(stream)
      startRecording(props.maxDuration)
    } catch (error) {
      console.error(error)
    }
  }
}

async function stopRec() {
  console.log('recording stopped')
  stopRecording()
  const audioBlob: Blob | null = await getAudioBlob();

  if (!audioBlob) {
    console.error('No audio blob found')
    return
  }

  if (props.apiEndpoint) {
    const response = await uploadAudioToAPI(audioBlob, props.apiEndpoint)
  }
}
</script>

<template>
  <template v-if="text">
    <button class="btn-cta" @click="startRec" :disabled="isRecording()">{{ text }}</button>
  </template>
  <template v-else>
    <button class="btn-cta" @click="startRec" :disabled="isRecording()">Start Recording</button>
  </template>
  <button @click="stopRec" :disabled="!isRecording()">Stop Recording</button>
</template>

<style scoped>
.btn-cta {
  background-color: #d0d0d5;
  border-width: 3px;
  border-color: #1b1b32;
  border-radius: 0;
  border-style: solid;
  color: #1b1b32;
  display: block;
  margin-bottom: 0;
  font-weight: normal;
  text-align: center;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  white-space: nowrap;
  padding: 6px 12px;
  font-size: 18px;
  line-height: 1.42857143;
}

.btn-cta:active:hover,
.btn-cta:focus,
.btn-cta:hover {
  background-color: #1b1b32;
  border-width: 3px;
  border-color: #000;
  background-image: none;
  color: #f5f6f7;
}
</style>
