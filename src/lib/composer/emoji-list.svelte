<script>
export let shortcode;
import {onMount, onDestroy, createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

export let target;
export let reply;
export let hide;

$: bounds = target.getBoundingClientRect()
$: top = bounds.top + bounds.height
$: bottom = bounds.height + 180

$: matchedEmojis = window.emoji.filter(x => x.shortcode.includes(shortcode))

$: matched = matchedEmojis[0]

$: if(matched) {
    dispatch('matched', matched.unicode)
}

$: if(matchedEmojis.length == 0) {
    window.removeEventListener('keydown', handleKeydown)
}


onMount(() => {
    dispatch('matched', matched?.unicode)
    if(matched != undefined) {
        window.addEventListener('keydown', handleKeydown)
    }
})

onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
})


function handleKeydown(e) {

    if(e.key == 'ArrowDown' || e.key == 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const currentIndex = matchedEmojis.indexOf(matched);
        const nextIndex = (currentIndex + 1) % matchedEmojis.length;
        matched = matchedEmojis[nextIndex];
    }

    if(e.key == 'ArrowUp' || (e.key == 'Tab' && e.shiftKey)) {
        e.preventDefault()
        const currentIndex = matchedEmojis.indexOf(matched);
        const previousIndex = (currentIndex - 1 + matchedEmojis.length) % matchedEmojis.length;
        matched = matchedEmojis[previousIndex];
    }

    if(e.key == 'Enter') {
        if(matched) {
            e.preventDefault()
            dispatch('selected', matched.unicode)
            matchedEmojis = []
            matched = undefined
        }
    }
}

function select(item) {
    dispatch('selected', item.unicode)
    matchedEmojis = []
    matched = undefined
}


let root;




</script>

{#if matchedEmojis.length > 0}
<div class="emoji-list" tabindex="0"
    bind:this={root}
    class:hide={hide}
    class:t={!reply}
    class:b={reply}
    style="--top:{top}px;--bottom:{bottom}px;">

    <div class="header">
            <span class="h">MATCHING</span>
            <span class="s ml1">:{shortcode}</span>
    </div>

    <div class="list fl fl-co">

        {#each matchedEmojis as item (item.hexcode)}
            <div class="emoji-item fl pa2" 
                on:click={select(item)}
                class:high={matched.shortcode == item.shortcode}>
                <div class="emoji-key">
                    {@html item.unicode}
                </div>
                <div class="emoji-shortcode ml3">
                    {item.shortcode}
                </div>
            </div>
        {/each}

    </div>

</div>
{/if}

<style>
.emoji-list {
    position: absolute;
    left: 0;
    right: 0;
    background-color: var(--emoji-list);
    margin-right: 2rem;
    margin-left: 2rem;
    margin-bottom: -4rem;
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 8px;
    box-shadow: 0px 1px 20px -5px rgba(0,0,0,0.1);
    z-index: 9999;
    max-height: 400px;
    overflow: hidden;
}

.hide {
    visibility: hidden;
}

.t {
    top: var(--top);
}

.b {
    bottom: var(--bottom);
}

.high {
    background-color: var(--shade-4);
}
.header {
    padding: 1rem 0.5rem;
}
.h {
    color: var(--text-light);
    font-weight: 500;
    font-size: small;
}
.s {
    font-weight: 500;
    font-size: small;
}
.list {
    overflow-y: auto;
}
.emoji-item{
    cursor: pointer;
}
.emoji-item:hover {
    background-color: var(--shade-4);
}
</style>
