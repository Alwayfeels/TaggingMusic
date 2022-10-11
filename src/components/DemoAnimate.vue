<template>
  <div class="scroll-wrapper">
    <Vue3SeamlessScroll :list="list" direction="right" hover>
      <!-- <template v-for="item in list" :key="item">
        <div class="px-6 py-2 mx-4 my-2 scroll-btn">{{item}}</div>
      </template> -->
      <div class="px-6 py-2 mx-4 my-2 scroll-btn">测试</div>
    </Vue3SeamlessScroll>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NTag } from "naive-ui";
import { h, Transition } from "vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";

function getTagButton(tag: string) {
  return h(
    NButton,
    {
      class: "ml-4 px-6",
      type: "success",
      size: "large",
      strong: true,
    },
    tag
  );
}

const list = Array(20)
  .fill(null)
  .map((e, index) => `测试 ${index}`);
// const render = () => {
//   return h(
//     Vue3SeamlessScroll,
//     {
//       list: list,
//       direction: "right",
//       hover: true,
//       class: "pt-4 w-full bg-gray-100 scroll-wrapper",
//     },
//     () => {
//       return list.map(e => getTagButton(e));
//     }
//   );
// };
</script>

<style lang="scss" scoped>
.button-moving {
  animation: moveRightAnimation 6s linear;
}

.scroll-wrapper {
  overflow: hidden;
  height: 100px;
  width: 100%;
}

.scroll-btn {
  background-color: #36ad6a;
  border-radius: 4px;
  text-align: center;
  color: #fff;
  cursor: pointer;
}
.scroll-btn:hover {
  background: #0c7a43;
}

@keyframes moveRightAnimation {
  from {
    transform: translateX(0px);
  }
  to {
    transform: translateX(300px);
  }
}
</style>