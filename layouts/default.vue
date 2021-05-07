<template>
  <div>
    <style>
      :root {
        --background-color: {{ backgroundColor }};
      }
    </style>
    <img id="ditto" :src="require('~/assets/ditto.gif')" alt="" />
    <img id="ditto2" :src="require('~/assets/ditto.gif')" alt="" />
    <nuxt></nuxt>
  </div>
</template>

<script>
export default {
  data() {
    return {
      h: 270,
    }
  },
  computed: {
    backgroundColor() {
      return `hsl(${this.h}, 90%, 45%)`
    },
  },
  mounted() {
    setInterval(() => {
      if (this.h <= 360) {
        return this.h++
      }
      this.h = 0
    }, 300)
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

@function randomNum($min, $max) {
  $rand: random();
  $randomNum: $min + floor($rand * (($max - $min) + 1));

  @return $randomNum;
}

html {
  // background-image: url('~/assets/ditto.gif');
  // background-repeat: no-repeat;
  // background-attachment: fixed;
  // background-position: center;
  background-color: var(--background-color);
}
#ditto {
  position: absolute;
  z-index: -1;
  animation: linear infinite alternate;
  animation-name: run;
  animation-duration: 10s;
  opacity: 0.6;
}
#ditto2 {
  position: absolute;
  z-index: -1;
  animation: linear infinite alternate;
  animation-name: run2;
  animation-duration: 10s;
  opacity: 0.6;
}
@keyframes run {
  0% {
    top: 10%;
    left: 0%;
    transform: translate(0%, -10%);
  }
  25% {
    top: 80%;
    left: 30%;
    transform: translate(-30%, -0%);
  }
  50% {
    top: 30%;
    left: 60%;
    transform: translate(-30%, -70%);
  }
  75% {
    top: 70%;
    left: 0%;
    transform: translate(0%, 0%);
  }
  100% {
    top: 80%;
    left: 76%;
    transform: translate(-30%, -50%);
  }
}
@keyframes run2 {
  0% {
    top: 10%;
    left: 20%;
    transform: translate(30%, -10%);
  }
  25% {
    top: 80%;
    left: 30%;
    transform: translate(30%, -0%);
  }
  50% {
    top: 30%;
    left: 50%;
    transform: translate(-30%, 70%);
  }
  75% {
    top: 0%;
    left: 50%;
    transform: translate(10%, 0%);
  }
  100% {
    top: 80%;
    left: 76%;
    transform: translate(-30%, -50%);
  }
}
</style>
