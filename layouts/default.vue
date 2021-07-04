<template>
  <div>
    <nuxt></nuxt>
  </div>
</template>

<script>
export default {}
</script>
<style lang="scss">
@import '~bulma/sass/utilities/_all';
@import '~@creativebulma/bulma-divider';

$loading-background: rgba(22, 22, 20, 0);
$progress-bar-background-color: #bdbdbd;
$button-border-color: rgba(0, 0, 0, 0);
$button-hover-border-color: rgba(0, 0, 0, 0);
$input-border-color: rgba(0, 0, 0, 0);
$input-hover-border-color: rgba(0, 0, 0, 0);

@import '~bulma';
@import '~buefy/src/scss/buefy';

button {
  background: linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%);
}
button:hover {
  background: linear-gradient(180deg, #00c9ff 0%, #92fe9d 100%);
}
input {
  background: linear-gradient(270deg, #00c9ff 0%, #92fe9d 100%);
}
input:hover {
  background: linear-gradient(80deg, #00c9ff 0%, #92fe9d 100%);
}
.content {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    color: #04ffff;
  }
}
h1,
h2,
h3,
h4,
h5,
h6 {
  color: #04ffff;
}
.label {
  color: #04ffff;
}
body,
html {
  background-color: #050202;
  background: url('../assets/background.png');
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
