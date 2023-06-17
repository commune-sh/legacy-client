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
    min-height: 200px;
    width: 223px;
    background-color: var(--popup-bg);
    border-radius: 5px;

}
</style>
