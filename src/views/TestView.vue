<template>
  <div class="home">
    <div style="width: 400px; margin: 20px">
      <PlayMusicBar></PlayMusicBar>
    </div>
  </div>
</template>

<script setup>
// @ is an alias to /src
import { ref, h, computed, watch, nextTick, onMounted } from "vue";
import PlayMusicBar from "@/components/PlayMusicBar.vue";
let selectRef = ref();

let tagInputVal = ref(null);
let activeTags = [{ label: "test", value: "test" }];

function focusHandler() {
  console.log('focccccccccccccccus!!!')
}
</script>
