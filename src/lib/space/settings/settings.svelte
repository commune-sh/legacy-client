<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import General from './pages/general.svelte'

const dispatch = createEventDispatcher()


</script>

<div class="space-settings">
    <General />
</div>


<style>
.space-settings {
    display: grid;
}

</style>

