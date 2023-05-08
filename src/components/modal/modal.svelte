<script>
import { onMount, createEventDispatcher } from 'svelte'
import { fade, fly } from 'svelte/transition'

const dispatch = createEventDispatcher()

export let noStyle = false;

let kill =() => {
    dispatch('kill', true)
}

onMount(() => {
})

</script>

<div class="mask grd" 
    on:click|self={kill}
    transition:fade="{{duration: 100}}">
    <div class="modal grd-c" 
        class:default={!noStyle}
        in:fly="{{ y: -200, duration: 100 }}">
        <slot></slot>
    </div>
</div>


<style>
.mask {
    transition: 0.3s;
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: var(--mask);
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.modal {
    transition: 0.2s;
    box-shadow: 0 30px 60px rgba(0,0,0,.1);
}
.default {
    background-color: var(--background-3);
    border-radius: 7px;
    min-wdith: 400px;
    min-height: 300px;
}

</style>

