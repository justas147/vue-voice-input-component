<script setup lang="ts">
import { uploadAudioToAPI } from '../composables/uploader'
import { mediaRecorderWrapper } from '../composables/recorderWrapper'
import microphoneUrl from '../assets/microphone.svg'

const props = defineProps({
  text: { type: String, default: 'Start Recording' },
  maxDuration: { type: Number, default: 5000, required: false },
  color: { type: String, default: '#1b1b32', required: false },
  apiEndpoint: { type: String, required: true },
  token: { type: String, required: false },
  formDataTag: { type: String, default: 'audio', required: false }
});

const emits = defineEmits(['getTranscript'])

const { 
  prepareRecording, 
  startRecording, 
  stopRecording, 
  isRecording
} = mediaRecorderWrapper()

async function startRec() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('getUserMedia is not supported')
    return
  }

  const constraints = {
    video: false,
    audio: {
      channelCount: 1,
      echoCancellation: false,
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    prepareRecording(stream)
    startRecording(props.maxDuration)
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

async function stopRec() {
  try {
    const audioBlob: Blob | null = stopRecording();

    if (!audioBlob) {
      console.error('No audio blob found')
      return
    }

    if (!props.apiEndpoint) {
      console.error('No API endpoint provided')
      return
    }

    const transformedResponse = await uploadAudioToAPI(audioBlob, props.apiEndpoint)
    emits('getTranscript', transformedResponse)
  } catch (error) {
    console.error('Error during recording stop:', error)
    return
  }
}

function toggleRecording() {
  if (isRecording()) {
    stopRec()
  } else {
    startRec()
  }
}

// TODO: clean up the styling of button
</script>

<template>
  <button
    class = "btn-cta"
    :class="isRecording() ? 'record-start' : ''"
    @click="toggleRecording"
  >
    <img 
      :src="microphoneUrl" 
      alt="microphone"  
    />
  </button>
</template>

<style scoped>
.record-start {
  background-color: red;
}

.record-stop {
  background-color: #d0d0d5;
}

.btn-cta {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;

  border-width: 3px;
  border-radius: 50%;
  border-style: solid;

  text-align: center;

  -ms-touch-action: manipulation;
  touch-action: manipulation;

  cursor: pointer;
  white-space: nowrap;
}
</style>
