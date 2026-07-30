<script>
  import { onMount, onDestroy } from 'svelte';
  let container;
  let globeInstance;
  import createGlobe from '../../src/index.js';

  onMount(() => {
    globeInstance = createGlobe(container, { /* options */ });
  });

  onDestroy(() => {
    if (globeInstance && typeof globeInstance.destroy === 'function') {
      globeInstance.destroy();
    }
  });
</script>

<div bind:this={container} style="width: 400px; height: 400px;"></div>
