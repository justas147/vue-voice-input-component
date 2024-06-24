<script setup lang="ts">
import microphoneUrl from '../assets/microphone.svg'
import { onMounted, onUnmounted, ref } from 'vue';
import { uploadAudioToAPI } from '../composables/uploader'

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
});

const audioBlobRef = ref<Blob | null>(null)
const isRecordingRef = ref<boolean>(false)
const audioChunks = ref<Blob[]>([])
const mediaStream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)

const emits = defineEmits(['recordingStop', 'recordingStart'])

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

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
    mediaRecorder.value.onstop = onStopHandler
  
    mediaRecorder.value.start()
    isRecordingRef.value = true
    audioBlobRef.value = null
    emits('recordingStart')
  } catch (error) {
    console.error('Error during recording start:', error)
    return
  }
}

async function stopRec() {
  if (
    !mediaRecorder.value || 
    !isRecordingRef.value || 
    mediaRecorder.value.state === 'inactive' 
  ) {
    throw new Error('MediaRecorder is not prepared or not recording')
  }

  try {
    mediaRecorder.value?.stop()
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop()
    });
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

const onDataAvailableHandler = (event: BlobEvent) => {
  audioChunks.value.push(event.data)
}

const onStopHandler = async (event: Event) => {
  const audioBlob = new Blob(audioChunks.value, {
    type: props.blobType,
  })

  audioBlobRef.value = audioBlob
  isRecordingRef.value = false
  audioChunks.value = []

  const response = await uploadAudioToAPI(
    audioBlob,
    props.audioContraints,
    props.apiEndpoint,
    props.apiHeaders,
    props.formDataTag,
  )

  emits('recordingStop', response)
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

  audioChunks.value = []
  audioBlobRef.value = null
  mediaRecorder.value = null
  mediaStream.value = null
  isRecordingRef.value = false
})

onUnmounted(() => {
  if (isRecordingRef.value) {
    stopRec()
  }

  audioChunks.value = []
  audioBlobRef.value = null
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
