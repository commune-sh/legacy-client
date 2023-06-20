<script>
import {createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}
</script>

<div class="user-popup">
<button on:click={kill}>kill</button>
</div>

<style>
.user-popup {
    min-height: 300px;
    width: 240px;
    background-color: var(--shade-3);
    border-radius: 7px;

}
</style>
