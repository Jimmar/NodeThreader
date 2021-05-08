<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link :to="{ name: 'Home' }">
        <div class="navbar-item" style="margin: 0px">
          <div class="logo-container">
            <b> NT </b>
          </div>
        </div>
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {};
</script>

<style>
.logo-container {
  border-radius: 5px;
  background-color: white;
  color: black;
  padding: 10px;
}
</style>
