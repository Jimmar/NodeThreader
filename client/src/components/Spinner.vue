<template>
  <div :style="cssVars" class="spinner"></div>
</template>

<script>
export default {
  props: {
    hide: { type: Boolean, default: false },
    size: { type: Number, default: 30 },
    colorMain: { type: String, default: "#f3f3f3" },
    colorAccent: { type: String, default: "#00d1b2" },
    position: { type: String, default: "static" },
  },
  computed: {
    cssVars() {
      return {
        "--visibility": this.hide ? "hidden" : "visible",
        "--size": this.size + "px",
        "--colorMain": this.colorMain,
        "--colorAccent": this.colorAccent,
        "--position": this.position,
        "--animationPlayState": this.hide ? "paused" : "running",
      };
    },
  },
};
</script>

<style scoped>
.spinner {
  border: 16px solid var(--colorMain);
  border-top: 16px solid var(--colorAccent);
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
  animation: spin 1s linear infinite;
  animation-play-state: var(--animationPlayState);
  position: var(--position);
  visibility: var(--visibility);
  margin: auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
