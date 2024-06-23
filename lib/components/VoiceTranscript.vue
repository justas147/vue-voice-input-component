<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  transcription: { type: String, required: false, default: '' },
  typeSpeed: { type: Number, required: false, default: 50 },
});

const displayText = ref('');
const interval = ref<NodeJS.Timeout | null>(null);

watch(
  () => props.transcription, 
  (newVal: string | null, oldVal: string | null) => {
    if (newVal === '') return;

    if (interval.value) {
      clearInterval(interval.value);
    }

    displayText.value = '';
    typeText();
  }
);

onMounted(() => {
  displayText.value = '';
});

onUnmounted(() => {
  displayText.value = '';
});

function typeText() {
  let index = 0;
  const text = props.transcription;
  const speed = props.typeSpeed;

  interval.value = setInterval(() => {
    if (index >= text.length) {
      clearInterval(interval.value!);
    } else {
      displayText.value += text[index];
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

<style scoped>
p {
  margin: 0;
}
</style>