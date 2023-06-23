<script>
import { onMount, onDestroy, createEventDispatcher } from 'svelte'
import { fly } from 'svelte/transition'
import { down, check } from '$lib/assets/icons.js'

const dispatch = createEventDispatcher()


export let items;
export let value;

let selected = value;

function select(item) {
    selected = item
    dispatch('change', selected)
    kill()
}


let active = false;

function toggle() {
    active = !active
}

$: if(active) {
    setTimeout(() => {
        document.addEventListener('click', killMe)
    }, 10)
} else {
    document.removeEventListener('click', killMe)
}

onDestroy(() => {
    document.removeEventListener('click', killMe)
})

let selector;

let killMe = (e) => {
    if(e.target !== selector && !selector?.contains(e.target)){
        kill()
    }
}

function kill() {
    active = false
}

</script>

<div class="fl fl-co rel" bind:this={selector}>
    <div class="select fl" on:click={toggle}>
        <div class="grd-c fl-o">
            {selected}
        </div>
        <div class="ico-s grd-c">
            {@html down}
        </div>
    </div>
    {#if active}
        <div class="select-options"
        in:fly="{{ y: -20, duration: 70 }}">
            {#each items as item, i (i)}
                <div class="select-option fl" 
                    class:selected={item.value == selected}
                    on:click={select(item.value)}>
                    <div class="grd-c fl-o">
                        {item.text}
                    </div>
                    {#if item.value == selected}
                        <div class="ico-s grd-c">
                            {@html check}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
.select {
    background-color: var(--bg);
    width: 100%;
    padding: 0.5rem 1rem;
    transition: 0.1s;
    border: 1px solid var(--input-border);
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 5px;
    font-weight: bold;
}
.select-options {
    position: absolute;
    top: 40px;
    background-color: var(--bg);
    width: 100%;
    transition: 0.1s;
    cursor: pointer;
    z-index: 10000;
    border-radius: 5px;
}
.select-option {
    padding: 0.5rem 1rem;
}
.select-option:hover {
    color: var(--primary);
    background-color: var(--bg);
}
.selected {
    font-weight: bold;
}
.rel {
    position: relative;
}

.select:hover .ico-s {
    fill: var(--primary);
}
</style>

