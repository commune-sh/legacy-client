<script>
import { store } from '$lib/store/store.js'
import { onMount, onDestroy, tick } from 'svelte'
import { em1, em2, em3, em4, em5, em6, em7, em8, em0 } from '$lib/assets/icons.js'
import EMOJIBASE from 'emojibase-data/en/compact.json';
import SHORTCODES from 'emojibase-data/en/shortcodes/joypixels.json';

EMOJIBASE.forEach(item => {
    let code = ``
    let shortcodes = SHORTCODES[item.hexcode]
    if(Array.isArray(shortcodes)) {
        shortcodes.forEach(x => {
            code = code + `:${x}: `
        })
    } else {
        code = `:${shortcodes}:`
    }
    if(code == `:undefined:`) {
        const words = item.label.split(' ');
        const joined = words.join('_');
        code = `:${joined}:`;
    }
    item.shortcode = code
    item.baseunicode = item.unicode
})


window.emoji = EMOJIBASE

$: people = EMOJIBASE.filter(x => x.group == 0 || x.group == 1)
$: nature = EMOJIBASE.filter(x => x.group == 3)
$: food = EMOJIBASE.filter(x => x.group == 4)
$: travel = EMOJIBASE.filter(x => x.group == 5)
$: activities = EMOJIBASE.filter(x => x.group == 6)
$: objects = EMOJIBASE.filter(x => x.group == 7)
$: symbols = EMOJIBASE.filter(x => x.group == 8)
$: flags = EMOJIBASE.filter(x => x.group == 9)

$: emojis = {
    people: {
        emoji: people,
        icon: em1,
        name: 'em-people'
    },
    nature: {
        emoji: nature,
        icon: em2,
        name: 'em-nature'
    },
    food: {
        emoji: food,
        icon: em3,
        name: 'em-food'
    },
    travel: {
        emoji: travel,
        icon: em4,
        name: 'em-travel'
    },
    activities: {
        emoji: activities,
        icon: em5,
        name: 'em-activities'
    },
    objects: {
        emoji: objects,
        icon: em6,
        name: 'em-objects'
    },
    symbols: {
        emoji: symbols,
        icon: em7,
        name: 'em-symbols'
    },
    flags: {
        emoji: flags,
        icon: em8,
        name: 'em-flags'
    },
}

let root;

$: target = $store.emojiPicker.target 


$: active = $store.emojiPicker.active &&
    $store.emojiPicker.target != null



$: if(active) {
    console.log($store.emojiPicker)
}

function kill() {
    store.killEmojiPicker()
}

$: bounding = target?.getBoundingClientRect()

$: top = bounding?.top
$: right = document.body.clientWidth - bounding?.right + target?.offsetWidth

function log(item) {
    console.log(item)
}

$: hoveredEmoji = people[0].unicode
$: hoveredShortcode = people[0].shortcode
let placeholder = "Search";
let moved = false

function changePlaceholder(e) {
    if(e.target?.className?.includes?.('emoji-key')) {
        moved = true
        placeholder = e.target.title
        hoveredEmoji = e.target.getAttribute('alt')
        hoveredShortcode = e.target.title
    }
}

function scrollToCategory(set) {
    let el = document.getElementById(set.name)
    if(el) {
        el.scrollIntoView()
    }
}

function isSelected(title) {
    console.log(highlighted, title)
    return highlighted === `title-${title}`
}

let highlighted = `title-people`;

onMount(() => {
  const contentSections = document.querySelectorAll('.emoji-title')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targetId = entry.target.id;
        if (entry.isIntersecting) {
            highlighted = targetId
        }
      });
    },
    { threshold: 0.5 } // Adjust threshold as needed
  );

  contentSections.forEach((section) => {
    observer.observe(section);
  });
})

</script>

<div class="root" 
    class:inactive={!active}
    bind:this={root} on:click|self={kill}>

    <div class="emoji-picker"
        style="--top:{top}px;--right:{right}px">

        <div class="header">
            <div class="search pa3">
                <input placeholder={placeholder} />
            </div>
        </div>

        <div class="container">

            <div class="categories fl fl-co">

                {#each Object.entries(emojis) as [title, set] ,i}
                    <div class="cat grd-c pa1 ma2" 
                        class:high={highlighted === `title-${title}`}
                        on:click={scrollToCategory(set)}>
                        {@html set.icon}
                    </div>
                {/each}


            </div>

            <div class="emoji-container"
            on:mouseover={changePlaceholder}>

                <div class="emojis">
                        {#each Object.entries(emojis) as [title, set] ,i}
                            <div id="em-{title}" class="fl fl-co mb3">
                                <div id="title-{title}" class="emoji-title pl1 fl">
                                    <div class="tin-c grd-c">
                                        {@html set.icon}
                                    </div>
                                    <div class="tt ml1 grd-c">
                                        {title}
                                    </div>
                                </div>
                                <div class="con">
                                    {#each set.emoji as item (item.order)}
                                        <div class="emoji-item gr-default">
                                            <div class="emoji-key"
                                            alt={item.unicode}
                                            on:click={log(item)}
                                            title={item.shortcode}>
                                                {@html item.unicode}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}

                </div>


                <div class="emoji-preview fl">
                    <div class="grd-c ml2 hov-e">
                        {hoveredEmoji} 
                    </div>
                    <div class="hov-s ml2 grd-c fl-o">
                        {hoveredShortcode}
                    </div>
                </div>

            </div>

        </div>

    </div>
</div>


<style>
.inactive {
    visibility: hidden;
    pointer-events: none!important;
}

.root {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 9999999;
}

.emoji-picker {
    position: absolute;
    top: var(--top);
    right: var(--right);
    pointer-events: auto;
    overflow: hidden;
    height: 550px;
    width: 400px;
    background: var(--emoji-picker);
    border-radius: 8px;
    display: grid;
    grid-template-rows: auto 1fr;
}

.header {
    border-bottom: 1px solid var(--bg);
}

.container {
    display: grid;
    grid-template-columns: auto 1fr;
    overflow: hidden;
}

.emoji-container {
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
}

.categories {
    width: 40px;
}

.cat {
    height: 20px;
    width: 20px;
    filter: grayscale(1);
    border-radius: 4px;
    cursor: pointer;
    transition: 0.1s;
}

.cat:hover {
    background-color: var(--shade-4);
    filter: none;
}

.high {
    background-color: var(--shade-4);
    filter: none;
}

.emojis {
    overflow: hidden auto;
    width: 100%;
    height: 100%;
    scroll-behavior: auto;
}

.emoji-item {
    padding: 0.4rem;
    cursor: pointer;
    width: 22px;
    height: 22px;
    border-radius: 3px;
}

.emoji-item:hover {
    background-color: var(--shade-4);
}

.emoji-key {
    font-size: 22px;
    line-height: 22px;
    font-family: Twemoji;
    justify-self: center;
    align-self: center;
}



.emojis {
    overflow-x: hidden;
    overflow-y: scroll;
    display: grid;
    grid-template-rows: repeat();
    width: 100%;
    height: 100%;
    scroll-behavior: auto;
    background-color: var(--background-2);
    position: relative;
}


.con {
    display: grid;
    grid-template-columns: repeat(9, 40px);
}

.emoji-title {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-light);
    line-height: 12px;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    background: var(--emoji-picker);
    padding: 0.5rem 0;
    padding-left: 0.5rem;
    z-index: 25;
}

.tt {
    vertical-align: bottom;
}

.search {
    height: 40px;
}



input {
    width: 100%;
    height: 100%;
    padding: 0.25rem;
    font-size: 14px;
}

.tin-c {
    width: 16px;
    height: 16px;
}
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
}
.emoji-preview {
    height: 60px;
}
.hov-e {
    font-size: 28px;
}

.hov-s {
    font-weight: bold;
    font-size: 1rem;
}
</style>
