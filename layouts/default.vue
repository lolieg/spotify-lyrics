<template>
  <div>
    <nuxt></nuxt>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>
<style lang="scss">
@import '~bulma/sass/utilities/_all';

$loading-background: rgb(22, 22, 20);
$progress-bar-background-color: #bdbdbd;
$button-background-color: #1db954;
$button-border-color: #191414;

@import '~bulma';
@import '~buefy/src/scss/buefy';

html {
  background-color: #3698c2;
}
</style>
