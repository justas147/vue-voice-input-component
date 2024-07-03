<script setup lang="ts">
import microphoneUrl from '../assets/microphone.svg'
import { onMounted, onUnmounted, ref } from 'vue';
import io from 'socket.io-client';

const props = defineProps({
  maxDuration: { type: Number, required: false, default: 5000 },
  apiEndpoint: { type: String, required: true },
  apiHeaders: { type: Object, required: false, default: () => (undefined) },
  formDataTag: { type: String, required: false, default: 'audio' },
  audioContraints: { type: Object, required: false, default: () => ({
    channelCount: 1,
    echoCancellation: false,
    sampleRate: 16000,
  }) },
  blobType: { type: String, required: false, default: 'audio/webm;codecs=opus' },
  timeslice: { type: Number, required: false, default: 1000 },
  language: { type: String, required: false, default: 'en-US' },
});

const socket = ref<any>(undefined)
const socketData = ref<string>('')
const isRecordingRef = ref<boolean>(false)
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const timesliceLimit = ref<number>(0)

const emits = defineEmits(['recordingStop', 'recordingStart', 'transcriptUpdate'])

const isRecording = () => isRecordingRef.value

async function startRec() {
  if (
    isRecordingRef.value ||
    (mediaRecorder.value && mediaRecorder.value.state === 'recording')
  ) {
    throw new Error('MediaRecorder is not prepared or already recording')
  }

  try {
    const constraints = {
      video: false,
      audio: props.audioContraints,
    };

    socket.value = io(props.apiEndpoint)
    socket.value.emit('startStream', JSON.stringify({
      ...props.audioContraints,
      language: props.language,
    }))
    socket.value.on('transcription', onMessageHandler)
    socket.value.on('streamError', (error: any) => {
      console.error('Error during stream:', error)
      stopRec()
    })

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream
    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.start(props.timeslice)

    setTimeSliceLimit()
    isRecordingRef.value = true
    socketData.value = ''
    
    emits('recordingStart')
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

function stopRec() {
  if (
    !mediaRecorder.value || 
    !isRecordingRef.value || 
    mediaRecorder.value?.state === 'inactive' 
  ) {
    throw new Error('MediaRecorder is not prepared or not recording')
  }

  isRecordingRef.value = false

  try {
    mediaRecorder.value?.stop()
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop()
    });

    socket.value?.emit('endStream')
    socket.value?.off('transcription')
    socket.value?.off('audioChunk')
    socket.value?.close()
    emits('recordingStop', socketData.value)
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

const setTimeSliceLimit = () => {
  const limit = props.maxDuration / props.timeslice

  if (limit < 1) {
    timesliceLimit.value = 1
  }

  timesliceLimit.value = Math.floor(limit)
}

const onDataAvailableHandler = (event: BlobEvent) => {
  socket.value?.emit('audioChunk', event.data)
}

const onMessageHandler = (data: any) => {
  socketData.value = socketData.value + data
  console.log('Message from server:', socketData.value)
  emits('transcriptUpdate', { transcription: socketData.value })
}

onMounted(async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia is not supported')
  }

  if (!props.apiEndpoint) {
    throw new Error('No API endpoint provided')
  }

  if (!MediaRecorder.isTypeSupported(props.blobType)) {
    console.error('Blob type is not supported')
    return
  }

  socket.value = undefined
  mediaRecorder.value = null
  mediaStream.value = null
  isRecordingRef.value = false
})

onUnmounted(() => {
  if (isRecordingRef.value) {
    stopRec()
  }

  socket.value = undefined
  mediaRecorder.value = null
  mediaStream.value = null
  isRecordingRef.value = false
})
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
