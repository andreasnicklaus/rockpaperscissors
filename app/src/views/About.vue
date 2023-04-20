<template>
  <div :style="{ display: 'grid', placeItems: 'center', height: '100%' }">
    <b-card
      id="card"
      title="Andreas Nicklaus"
      :img-src="profilBild"
      img-alt="Image"
      img-top
      tag="article"
      style="max-width: 20rem"
      class="mb-2"
    >
      <b-card-text>
        Student an der Hochschule der Medien und Softwareentwickler mit Freude
        an schweren Aufgaben
      </b-card-text>

      <b-button-group>
        <b-button href="https://andreasnicklaus.de" variant="primary">
          Homepage
        </b-button>
        <b-button href="https://github.com/andreasnicklaus">
          <b-icon-github>Github</b-icon-github>
        </b-button>
        <b-button href="https://www.linkedin.com/in/andreasnicklaus/">
          <b-icon-linkedin>LinkedIn</b-icon-linkedin>
        </b-button>
        <b-button href="https://www.instagram.com/andreasnicklaus/">
          <b-icon-instagram>Instagrm</b-icon-instagram>
        </b-button>
      </b-button-group>
    </b-card>
  </div>
</template>

<script>
import profilBild from "@/assets/Andi_Basketball.jpg";
export default {
  name: "AboutView",
  data() {
    return {
      profilBild,
    };
  },
};
</script>

<style lang="scss" scoped>
#card {
  background-color: var(--background-color);
  border: 1px solid var(--shadow-color);
  border-radius: 18px;
  box-shadow: var(--shadow-color) 20px 20px;
  overflow: hidden;
}
</style>
