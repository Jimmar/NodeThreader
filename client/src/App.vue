<template>
  <Nav />
  <router-view />
  <Footer />
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
</style>
