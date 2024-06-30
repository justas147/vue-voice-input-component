<script setup lang="ts">
import { VoiceTranscriptComponent } from '../';
</script>

<template>
  <div class="container">
    <VoiceTranscriptComponent apiEndpoint="ws://localhost:5000"/>
  </div>
</template>

<style scoped>
.container {
  width: 500px;
}
</style>
