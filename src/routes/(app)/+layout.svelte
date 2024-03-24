<script>
import NativeView from './native-view.svelte'
import DynamicView from './dynamic-view.svelte'

export let data;


$: legacy_matrix_mode = data.legacy_matrix_mode
$: legacy_matrix_open = data.legacy_matrix_open

</script>


{#if !legacy_matrix_mode}
    <DynamicView {data} />
{:else}
    <NativeView {data} />
{/if}




<style>

</style>
