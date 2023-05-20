<script>
import { onMount } from 'svelte'
import { more } from '../../../assets/icons.js'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export let event;

let el;

onMount(() => {
    tippy(el, {
        content: 'My tooltip!',
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'light-border',
        placement: 'bottom',

    });
})

</script>

<div class="more c-ico" on:click|stopPropagation bind:this={el}>
    {@html more}
</div>

<style>
.more {
    width: 20px;
}
</style>
