<script setup lang="ts">
import { VoiceTranscriptComponent } from '../';
</script>

<template>
  <div class="container">
    <VoiceTranscriptComponent apiEndpoint="http://localhost:3000/upload"/>
  </div>
</template>

<style scoped>
.container {
  width: 500px;
}
</style>
