import { onMounted, onUnmounted, ref } from 'vue'

export function mediaRecorderWrapper() {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const isRecordingRef = ref<boolean>(false)
  const audioChunks = ref<Blob[]>([])
  const audioBlobRef = ref<Blob | null>(null)

  const duration = ref<number>(0)

  let stopPromiseResolve: (() => void) | null = null;

  const isRecording = () => isRecordingRef.value

  const getAudioBlob = (): Promise<Blob | null> => {
    if (!isRecordingRef.value && audioBlobRef.value) {
      return Promise.resolve(audioBlobRef.value);
    }

    return new Promise((resolve) => {
      stopPromiseResolve = () => {
        resolve(audioBlobRef.value);
        stopPromiseResolve = null;
      }
    })
  }

  const prepareRecording = (stream: any) => {
    mediaRecorder.value = new MediaRecorder(stream)

    mediaRecorder.value.ondataavailable = (event) => {
      console.log('data available')
      console.log(event)
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      audioChunks.value = []
      audioBlobRef.value = audioBlob
      if (stopPromiseResolve) {
        stopPromiseResolve();
      }
    }
  }

  const startRecording = (maxDuration: number) => {
    if (
      !mediaRecorder.value ||
      isRecordingRef.value ||
      mediaRecorder.value.state === 'recording'
    ) {
      console.error('MediaRecorder is not prepared or already recording')
      return
    }

    setTimeout(() => {
      if (
        isRecordingRef.value ||
        mediaRecorder.value?.state !== 'inactive'
      ) {
        stopRecording()
      }
    }, maxDuration)

    mediaRecorder.value.start()
    isRecordingRef.value = true
  }

  const stopRecording = () => {
    if (
      !mediaRecorder.value || 
      !isRecordingRef.value || 
      mediaRecorder.value.state === 'inactive' 
    ) {
      console.error('MediaRecorder is not prepared or already stopped')
      return
    }

    mediaRecorder.value?.stop()
    isRecordingRef.value = false
  }

  onMounted(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Media Devices are not supported from your browser.')
      return
    }

    audioChunks.value = []
    audioBlobRef.value = null
  })

  onUnmounted(() => {
    if (isRecordingRef.value) {
      stopRecording()
    }

    audioChunks.value = []
    audioBlobRef.value = null
  })

  return { 
    isRecording, 
    prepareRecording, 
    startRecording, 
    stopRecording,
    getAudioBlob
  }
}