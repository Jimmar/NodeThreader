<template>
  <div class="flex-wrapper">
    <Nav />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export default {
  setup() {},

  components: {
    Nav,
    Footer,
  },
};
</script>

<style>
.flex-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
