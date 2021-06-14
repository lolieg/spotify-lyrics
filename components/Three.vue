<template>
  <div id="container" ref="container"></div>
</template>

<script>
import * as THREE from 'three'
export default {
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      light: null,
      cube: null,
    }
  },
  mounted() {
    const container = this.$refs.container
    // SET AND ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 2, 2)
    // ADD SCENE
    this.scene = new THREE.Scene()
    // ADD LIGHT TO SCENE
    this.light = new THREE.DirectionalLight('#bb00ff')
    this.scene.add(this.light)
    this.light.position.set(0, 2, 1)
    // RENDER IN PAGE
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(this.renderer.domElement)

    window.addEventListener('resize', onWindowResize, false)
    const self = this
    function onWindowResize() {
      if (this.camera === null) {
        return
      }
      self.camera.aspect = window.innerWidth / window.innerHeight
      self.camera.updateProjectionMatrix()

      self.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: '#db2c09', wireframe: false })
    )
    this.cube.position.set(0, 2, 0)
    this.scene.add(this.cube)
    this.light.target = this.cube

    function addStar() {
      const geometry = new THREE.SphereGeometry(0.25, 24, 24)
      const material = new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
      const star = new THREE.Mesh(geometry, material)

      const [x, y, z] = new Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(300))

      star.position.set(x, y, z)
      self.scene.add(star)
    }

    new Array(500).fill().forEach(addStar)

    this.animate()
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
      this.cube.rotation.x += 0.01
      this.cube.rotation.z += 0.01
    },
  },
}
</script>

<style>
#container {
  position: fixed;
  top: 0;
  left: 0;
}
</style>
