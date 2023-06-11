<script>
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { more } from '$lib/assets/icons.js'
import ViewSource from './source.svelte'
import tippy from 'tippy.js';

const dispatch = createEventDispatcher();

export let event;

let el;
let content;

let menu;

let active = false;

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
            active = true
            dispatch('active', true)
        },
        onHide(i) {
            active = false
            dispatch('kill', true)
        },
        onClickOutside(i) {
            active = false
            dispatch('kill', true)
        },
    });
})



function viewSource() {
    store.showModal(ViewSource, {
        event: event
    })
    menu.hide()
}



</script>


<div class="menu fl-co" bind:this={content}>
    <div class="m-item" on:click|stopPropagation={viewSource}>
        Log Event
    </div>
</div>

<div class="more grd-c c-ico" 
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    {@html more}
</div>

<style>
.menu {
    width: 160px;
    z-index: 901;
}
.more {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    padding: 0.25rem;
}

.more:hover {
    background-color: var(--shade-2);
}

.ac {
    background-color: var(--shade-2);
}


.m-item{
    padding: 0.5rem;
    cursor: pointer;
}
.m-item:hover{
    background-color: var(--shade-2);
}
</style>
