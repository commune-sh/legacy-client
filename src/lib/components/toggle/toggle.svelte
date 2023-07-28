<script>
import { createEventDispatcher } from 'svelte'
import { check, close } from '$lib/assets/icons.js'
export let toggled = false;

const dispatch = createEventDispatcher()

function toggle() {
    toggled = !toggled;
    dispatch('toggle', toggled)
}
</script>


<div class="toggle" 
    class:green={toggled}
    on:click={toggle}>
    <div class="icon ico-s" class:toggled={toggled}>
        {#if toggled}
            {@html check}
        {:else}
            {@html close}
        {/if}
    </div>
</div>

<style>
.toggle {
    background: var(--shade-4);
    border-radius: 500px;
    padding: 3px;
    height: 20px;
    width: 45px;
    cursor: pointer;
    position: relative;
}
.green {
    background: var(--primary);
}

.icon {
    position: absolute;
    left: 3px;
    transition: 0.4s;
    fill: var(--shade-4);
    opacity: 1;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--text-light);
    transition: 0.1s;
}

.toggled {
    background: white;
    transform: translate(25px, 0);
    fill: var(--shade-4);
}
</style>
