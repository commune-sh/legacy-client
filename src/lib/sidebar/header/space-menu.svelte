<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import {createEventDispatcher} from 'svelte';

const dispatch = createEventDispatcher();

function kill() {
    dispatch('kill')
}
</script>

<div class="user-popup">
    <div class="item">
        Leave Space
    </div>
</div>

<style>
.user-popup {
    width: 223px;
    background-color: var(--popup-bg);
    border-radius: 5px;
    padding: 0.25rem;
}

.item {
    padding: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
    cursor: pointer;
}
.item:hover {
    background-color: var(--context-menu-hover);
}
</style>
