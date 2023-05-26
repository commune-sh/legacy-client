<script>
import { onMount, createEventDispatcher } from 'svelte'
import { more } from '$lib/assets/icons.js'
import tippy from 'tippy.js';

const dispatch = createEventDispatcher();

export let event;

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'light-border',
        placement: 'bottom-end',
        arrow: false,
        duration: 1,
        onShown(i) {
            dispatch('active', true)
        },
        onHide(i) {
            dispatch('kill', true)
        },
        onClickOutside(i) {
            dispatch('kill', true)
        },
    });
})

function viewSource() {
    console.log(event)
    menu.hide()
}

</script>

<div class="menu fl-co" bind:this={content}>
    <div class="m-item" on:click|stopPropagation={viewSource}>
        Log Event
    </div>
</div>

<div class="more c-ico" on:click|stopPropagation bind:this={el}>
    {@html more}
</div>

<style>
.menu {
    width: 160px;
}
.more {
    width: 20px;
}
.m-item{
    padding: 0.5rem;
    cursor: pointer;
}
.m-item:hover{
    background-color: var(--shade-2);
}
</style>
