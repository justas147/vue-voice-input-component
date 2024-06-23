<script setup lang="ts">
import { ref } from 'vue';
import VoiceButton from './VoiceButton.vue'
import VoiceTranscript from './VoiceTranscript.vue'

const props = defineProps({
  // button props
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

  // transcript props
  speed: { type: Number, required: false, default: 50 },
});

const voiceTranscript = ref<string>('')

const getTranscript = (transcriptRespose: any) => {
  voiceTranscript.value = transcriptRespose.transcription
}

const clearTranscript = () => {
  voiceTranscript.value = ''
}
</script>

<template>
  <div class="voice-transcript-component-container">
    <div>
      <VoiceButton
        id="voice-button" 
        class="button"
        :maxDuration="props.maxDuration"
        :apiEndpoint="props.apiEndpoint"
        :apiHeaders="props.apiHeaders"
        :formDataTag="props.formDataTag"
        :audioContraints="props.audioContraints"
        :blobType="props.blobType"
        @recordingStop="getTranscript"
        @recordingStart="clearTranscript"
      />
    </div>
    <VoiceTranscript
      id="voice-transcript"
      class="transcript"
      :typeSpeed="props.speed"
      :transcription="voiceTranscript"
    />
  </div>
</template>

<style scoped>
.voice-transcript-component-container {
  display: flex;
  flex-direction: row;
}

.button {
  margin-right: 10px;
}

.transcript {
  width: 100%;
  padding: 8px 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>