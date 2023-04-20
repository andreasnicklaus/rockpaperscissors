<template>
  <div
    id="Info"
    :style="{ display: 'grid', placeItems: 'center', height: '100%' }"
  >
    <b-card
      id="card"
      img-src="https://cdn.theatlantic.com/thumbor/Er7vK5JSdS1voeQg05sL1C09Kmw=/80x16:1280x916/1200x900/media/img/mt/2014/09/The_More_You_Know/original.png"
      img-alt="Image"
      img-top
      style="max-width: 20rem"
    >
      <b-list-group :style="{ backgroundColor: 'transparent' }">
        A few bugs are known:
        <b-list-group-item
          >The game is generally very slow with low numbers of figures on the
          board.</b-list-group-item
        >
        <b-list-group-item
          >The border force field is very fiddly and I have jet figured it
          out.</b-list-group-item
        >
        <b-list-group-item
          >View slice results in overall slower games, but quicker finishes once
          the game is decided.</b-list-group-item
        >
      </b-list-group>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "InfoView",
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");
#Info {
  font-family: "Montserrat", sans-serif;
}
#card {
  background-color: var(--background-color);
  border: 1px solid var(--shadow-color);
  border-radius: 18px;
  box-shadow: var(--shadow-color) 20px 20px;
  overflow: hidden;
}

.list-group-item {
  background-color: transparent;
}
</style>
