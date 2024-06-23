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
  <div class="container">
    <VoiceButton 
      class="button"
      apiEndpoint="http://localhost:3000/upload" 
      @getTranscript="getTranscript"
    />
    <VoiceTranscript
      class="transcript" 
      :transcription="voiceTranscript"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.button {
  margin-right: 10px;
}

.transcript {
  border: 1px solid black;
}
</style>