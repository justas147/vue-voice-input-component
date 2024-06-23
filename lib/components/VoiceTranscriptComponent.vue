<script setup lang="ts">
import { ref } from 'vue';
import VoiceButton from './VoiceButton.vue'
import VoiceTranscript from './VoiceTranscript.vue'

// TODO: add all button and transcript props here

const voiceTranscript = ref<string>('')

const getTranscript = (transcript: string) => {
  voiceTranscript.value = transcript
}
</script>
<template>
  <div>
    <VoiceButton 
      apiEndpoint="http://localhost:3000/upload" 
      @getTranscript="getTranscript"
    />
    <VoiceTranscript 
      :transcription="voiceTranscript"
    />
  </div>
</template>