<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import General from './pages/general.svelte'

const dispatch = createEventDispatcher()


</script>

<div class="space-settings">
    <div class="header">
    </div>
    <div class="page">
        <General />
    </div>
</div>


<style>
.space-settings {
    display: grid;
    grid-template-rows: 48px auto;
    display: grid;
    padding: 1rem;
}
.page {
    display: grid;
    padding: 1rem;
}
</style>

