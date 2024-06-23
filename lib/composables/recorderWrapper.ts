import { onMounted, onUnmounted, ref } from 'vue'

export function mediaRecorderWrapper() {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const isRecordingRef = ref<boolean>(false)
  const audioChunks = ref<Blob[]>([])
  const audioBlobRef = ref<Blob | null>(null)

  const isRecording = () => isRecordingRef.value

  const prepareRecording = (stream: any) => {
    if (!stream) {
      throw new Error('MediaStream is not provided')
    }

    mediaStream.value = stream
    mediaRecorder.value = new MediaRecorder(stream)
    mediaRecorder.value.ondataavailable = onDataAvailableHandler
  }

  const startRecording = (maxDuration: number) => {
    if (
      !mediaRecorder.value ||
      (isRecordingRef.value || mediaRecorder.value.state === 'recording')
    ) {
      throw new Error('MediaRecorder is not prepared or already recording')
    }

    mediaRecorder.value.start()
    isRecordingRef.value = true
  }

  const stopRecording = (blobType: string = 'audio/webm;codecs=opus') => {
    if (
      !mediaRecorder.value || 
      !isRecordingRef.value || 
      mediaRecorder.value.state === 'inactive' 
    ) {
      throw new Error('MediaRecorder is not prepared or not recording')
    }
    
    mediaRecorder.value?.stop()
    mediaStream.value?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop()
    });

    const audioBlob = new Blob(audioChunks.value, {
      type: blobType,
    })
    audioBlobRef.value = audioBlob

    isRecordingRef.value = false
    audioChunks.value = []

    return audioBlob;
  }

  const getAudioBlob = (): Blob | null => {
    if (!isRecordingRef.value && audioBlobRef.value) {
      return audioBlobRef.value
    }

    return null;
  }

  const onDataAvailableHandler = (event: BlobEvent) => {
    audioChunks.value.push(event.data)
  }

  onMounted(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media Devices are not supported from your browser.')
    }

    audioChunks.value = []
    audioBlobRef.value = null
    mediaRecorder.value = null
    mediaStream.value = null
  })

  onUnmounted(() => {
    if (isRecordingRef.value) {
      stopRecording()
    }

    audioChunks.value = []
    audioBlobRef.value = null
    mediaRecorder.value = null
    mediaStream.value = null
  })

  return { 
    isRecording, 
    prepareRecording, 
    startRecording, 
    stopRecording,
    getAudioBlob
  }
}