<template>
  <div id="app">
    <navbar></navbar>
    <router-view></router-view>
    <!-- <end></end> -->
  </div>
</template>

<script>
import navbar from './components/Navbar.vue';
// import End from './components/End.vue';
export default {
  name: 'App',
  components: {
    navbar,
    // End
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>