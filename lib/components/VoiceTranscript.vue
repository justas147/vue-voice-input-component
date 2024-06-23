<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  transcription: { type: String, default: '' },
  typeSpeed: { type: Number, default: 50 },
});

const displayText = ref('');

watch(
  () => props.transcription, 
  (newVal: string | null, oldVal: string | null) => {
    console.log('newVal:', newVal);
    console.log('oldVal:', oldVal);
    if (newVal === '') return;
    displayText.value = '';
    typeText();
  }
);

onMounted(() => {
  displayText.value = '';
});

function typeText() {
  let index = 0;
  const text = props.transcription;
  const speed = props.typeSpeed;

  const interval = setInterval(() => {
    if (index >= text.length) {
      clearInterval(interval);
    } else {
      displayText.value += text[index];
      console.log(displayText.value);
      index++;
    }
  }, speed);
}
</script>

<template>
  <div>
    <p>{{ displayText }}</p>
  </div>
</template>

<style scoped></style>