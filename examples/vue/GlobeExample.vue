<template>
  <div ref="globeContainer" style="width: 400px; height: 400px;"></div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import createGlobe from '../../src/index.js'

export default {
  name: 'GlobeExample',
  setup() {
    const globeContainer = ref(null)
    let globeInstance = null

    onMounted(() => {
      globeInstance = createGlobe(globeContainer.value, { /* options */ })
    })

    onBeforeUnmount(() => {
      if (globeInstance && typeof globeInstance.destroy === 'function') {
        globeInstance.destroy()
      }
    })

    return { globeContainer }
  }
}
</script>
