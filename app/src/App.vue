<template>
  <b-col id="app">
    <router-view />
    <footer>
      <b-navbar>
        <b-navbar-nav class="m-auto">
          <b-nav-item to="/info" exact exact-active-class="active"
            >What to know</b-nav-item
          >
          <b-nav-item to="/" exact exact-active-class="active"
            >Rock, Paper, Scissors</b-nav-item
          >
          <b-nav-item to="/about" exact exact-active-class="active"
            >About me</b-nav-item
          >
        </b-navbar-nav>
      </b-navbar>
    </footer>
  </b-col>
</template>

<script>
export default {
  name: "App",
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap");
html {
  --background-color: bisque;
  --shadow-color: #3a2c26;
  background-color: var(--background-color);
  color: var(--shadow-color);
}
#app {
  font-family: "Playfair Display", serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: var(--background-color);
  color: var(--shadow-color);
  padding-top: 40px;
  padding-bottom: 30px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-item {
  padding: 6px 16px;
  border-radius: 999px;
  &:hover {
    background-color: var(--shadow-color);
    & > .nav-link {
      color: var(--background-color) !important;
    }
  }
}
</style>
