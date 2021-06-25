<template>
  <div>
    <b-loading v-if="showLoading" active></b-loading>
    <div
      id="container"
      ref="container"
      :style="{ visibility: !showLoading ? 'visible' : 'hidden' }"
    ></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import * as THREE from 'three'
import {
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Renderer,
  Scene,
  SphereGeometry,
} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import Vue from 'vue'
// const THREE = require('three')
export default Vue.extend({
  props: {
    songSpeed: {
      type: Number,
      default: 100,
    },
  },
  data() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const scene: Scene = new THREE.Scene()
    const renderer: Renderer = new THREE.WebGLRenderer()
    const light: DirectionalLight = new THREE.DirectionalLight('#ffffff', 1)
    scene.add(new AmbientLight('#ffffff', 0.01))

    const loader = new THREE.LoadingManager()
    const textureLoader = new THREE.TextureLoader(loader)

    const stats = Stats()
    stats.setMode(1)

    const urls = []
    for (let i = 1; i < 7; i++) {
      urls.push(require(`../assets/cubeMaps/${i}.png`))
    }
    const reflectionCube = new THREE.CubeTextureLoader().load(urls)
    const refractionCube = new THREE.CubeTextureLoader().load(urls)
    refractionCube.mapping = THREE.CubeRefractionMapping
    scene.background = reflectionCube

    const stars: Mesh<SphereGeometry, MeshBasicMaterial>[] = []
    const planet: Mesh<SphereGeometry, MeshPhongMaterial> = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshPhongMaterial({
        bumpScale: 0.0005,
        specular: new THREE.Color('#111111'),
      })
    )
    const clouds: Mesh<SphereGeometry, MeshPhongMaterial> = new THREE.Mesh(
      new THREE.SphereGeometry(0.503, 32, 32),
      new THREE.MeshPhongMaterial({
        map: textureLoader.load(require('../assets/earth_clouds.png')),
        transparent: true,
      })
    )

    return {
      loaded: false,
      showLoading: true,
      loader,
      textureLoader,
      stats,
      camera,
      scene,
      renderer,
      light,
      stars,
      planet,
      clouds,
    }
  },
  watch: {
    loaded() {
      if (this.loaded === true) {
        setTimeout(() => {
          this.$anime({
            targets: '#container',
            easing: 'easeInOutQuad',
            opacity: ['0%', '100%'],
            duration: 2000,
          })
          this.showLoading = false
        }, 400)
      }
    },
  },
  mounted() {
    const container: any = this.$refs.container
    // SET AND ADD CAMERA
    this.camera.position.set(0, 0, 2)
    // ADD LIGHT TO SCENE
    this.light.position.set(5, 3, 1)
    this.light.target = this.planet
    this.scene.add(this.light)
    // RENDER IN PAGE
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(this.renderer.domElement)
    if (process.env.NODE_ENV !== 'production') {
      container.appendChild(this.stats.dom)
    }

    window.addEventListener('resize', onWindowResize, false)
    const self = this
    function onWindowResize() {
      if (self.camera === null) {
        return
      }
      self.camera.aspect = window.innerWidth / window.innerHeight
      self.camera.updateProjectionMatrix()

      self.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    this.planet.material.map = this.textureLoader.load(
      require('../assets/earth.jpg')
    )
    this.planet.material.bumpMap = this.textureLoader.load(
      require('../assets/earth_bump_map.jpg')
    )
    this.planet.material.specularMap = this.textureLoader.load(
      require('../assets/earth_specular_map.png')
    )
    this.planet.position.set(0, 0, 1)
    // this.planet.rotation.set(0, 4, -0.1)
    this.planet.add(this.clouds)
    this.scene.add(this.planet)

    function addStar() {
      const geometry = new THREE.SphereGeometry(0.2, 2, 2)
      const material = new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
      const star = new THREE.Mesh(geometry, material)

      const [x, y, z] = new Array(3)
        .fill(1)
        .map(() => THREE.MathUtils.randFloatSpread(200))

      star.position.set(x, y, z)
      self.scene.add(star)
      return star
    }
    for (let i = 0; i < 500; i++) {
      this.stars.push(addStar())
    }

    this.loader.onLoad = () => (this.loaded = true)

    document.addEventListener('mousemove', (ev) => {
      this.camera.position.x = ev.x / 10000
      this.camera.position.y = ev.y / 10000

      this.camera.lookAt(this.planet.position)
    })
    this.animate()
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
      if (process.env.NODE_ENV !== 'production') {
        this.stats.update()
      }
      this.planet.rotation.y += 0.0007 * (this.songSpeed / 100)
      this.clouds.rotation.y += 0.0007 * (this.songSpeed / 100)

      for (const star of this.stars) {
        if (star.position.z > 50) {
          star.position.setZ(MathUtils.randInt(-200, -400))
        }
        star.position.z += this.songSpeed / 200
        // star.material.color.setHex(
        //   parseInt((this.songSpeed * 100000).toString(16), 16)
        // )
      }
    },
  },
})
</script>

<style>
#container {
  position: fixed;
  top: 0;
  left: 0;
}
</style>
