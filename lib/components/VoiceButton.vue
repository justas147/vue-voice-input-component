<script setup lang="ts">
import { uploadAudioToAPI } from '../composables/uploader'
import { mediaRecorderWrapper } from '../composables/recorderWrapper'
import microphoneUrl from '../assets/microphone.svg'

const props = defineProps({
  maxDuration: { type: Number, required: false, default: 5000 },
  apiEndpoint: { type: String, required: true },
  apiHeaders: { type: Object, required: false, default: () => (undefined) },
  formDataTag: { type: String, required: false, default: 'audio' },
  audioContraints: { type: Object, required: false, default: () => ({
    channelCount: 1,
    echoCancellation: false,
    sampleRate: 44100,
  }) },
  blobType: { type: String, required: false, default: 'audio/webm;codecs=opus' },
});

const emits = defineEmits(['recordingStop', 'recordingStart'])

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

  if (!MediaRecorder.isTypeSupported(props.blobType)) {
    console.error('Blob type is not supported')
    return
  }

  const constraints = {
    video: false,
    audio: props.audioContraints,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    prepareRecording(stream)
    startRecording(props.maxDuration)
    emits('recordingStart')
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

async function stopRec() {
  try {
    const audioBlob: Blob | null = stopRecording(props.blobType);

    if (!audioBlob) {
      console.error('No audio blob found')
      return
    }

    if (!props.apiEndpoint) {
      console.error('No API endpoint provided')
      return
    }

    const transformedResponse = await uploadAudioToAPI(
      audioBlob,
      props.audioContraints,
      props.apiEndpoint, 
      props.apiHeaders,
      props.formDataTag
    )
    emits('recordingStop', transformedResponse)
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
