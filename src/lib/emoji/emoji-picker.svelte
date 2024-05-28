<script>
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { onMount, onDestroy, tick } from 'svelte'
import GIFPicker from './gif-picker.svelte'
import { em1, em2, em3, em4, em5, em6, em7, em8, em0 } from '$lib/assets/icons.js'
import EMOJIBASE from 'emojibase-data/en/compact.json';
import SHORTCODES from 'emojibase-data/en/shortcodes/joypixels.json';

$: state = $store?.states[$page?.params?.space]

$: room_emoji = state?.space?.settings?.emoji || []

$: space_emoji = $store.space_emoji

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
$: space_alias = $store.emojiPicker?.space_alias


$: active = $store.emojiPicker.active &&
    $store.emojiPicker.target != null &&
    ($store.emojiPicker.reacting_to != undefined ||
    $store.emojiPicker.isGIF)



$: isChat = $store.emojiPicker.isChat == true
$: isGIF = $store.emojiPicker.isGIF == true

function kill() {
    store.killEmojiPicker()
    if(searchInput) {
        searchInput.value = null
    }
    query = ''
}


let picker;

$: position = $store.emojiPicker.position
$: positionRight = position == 'right'
$: positionLeft = position == 'left' || position == undefined


$: bounding = target?.getBoundingClientRect()

$: inside = bounding?.top + 600 < document.documentElement.clientHeight
$: at = document.documentElement.clientHeight - 550


$: top = inside ? bounding?.top - 4 : at


$: exceedsLeft = bounding?.right - 400 < 0
$: exceedsLeftBy = bounding?.right - 400

$: cRight = document.documentElement.clientWidth - bounding?.right + target?.offsetWidth + 10

$: right = exceedsLeft ? (cRight + exceedsLeftBy - 40) : cRight

$: left = bounding?.left + target?.offsetWidth + 20

function selectEmoji(item) {
    $store.emojiPicker.selected = item.unicode
    query = ''

}
function selectCustomEmoji(item) {
    $store.emojiPicker.selected = {
        name: item.name,
        url: item.url
    }
    query = ''
}

$: hoveredEmoji = people[0].unicode
let hoveredEmojiIsCustom = false
$: hoveredShortcode = people[0].shortcode

let placeholder = "Search";
let moved = false

function changePlaceholder(e) {
    if(e.target?.className?.includes?.('custom-emoji-key')) {
        hoveredEmojiIsCustom = true
        moved = true
        placeholder = e.target.title
        hoveredEmoji = e.target.getAttribute('url')
        hoveredShortcode = e.target.title
    } else if(e.target?.className?.includes?.('emoji-key')) {
        hoveredEmojiIsCustom = false
        moved = true
        placeholder = e.target.title
        hoveredEmoji = e.target.getAttribute('alt')
        hoveredShortcode = e.target.title
    }
}

function scrollToCategory(set) {
    highlighted = `title-${set.name}`
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

$: if(query == '') {
    highlighted = `title-people`
}

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

$: if (searchInput) {
    searchInput.focus()
}

let searchInput;
let query;

$: filtering = query?.length > 0

$: if(filtering) {
    highlighted = ``
}

async function focusSearchInput() {
    await tick()
    searchInput.focus()
}

function killFilter() {
    searchInput.value = null
    query = ''
    filterEmoji()
    focusSearchInput()
}

$: filtered = EMOJIBASE.filter(x => x.shortcode.includes(query))

function filterEmoji() {
    if(searchInput.value.length == 0) {
        highlighted = 'em-frequently'
    }
    let el = document.getElementById(`em-frequently`)
    if(el) {
        el.scrollIntoView(true)
    }
}


function switchToGIF() {
    $store.emojiPicker.isGIF = true
}

function switchToEmoji() {
    $store.emojiPicker.isGIF = false
    focusSearchInput()
}

</script>

<div class="em-root" 
    class:inactive={!active}
    bind:this={root} on:click|self={kill}>

    <div class="emoji-picker"
        class:chat={isChat}
        class:right={positionRight}
        class:left={positionLeft}
        bind:this={picker}
        style="--top:{top}px;--right:{right}px;--left:{left}px">


        {#if isChat}
            <div class="tab-nav fl">
                <div class="tn-item" 
                    on:click={switchToEmoji}
                    class:tn-a={!isGIF}>
                    Emoji
                </div>
                <div class="tn-item ml2" 
                    on:click={switchToGIF}
                    class:tn-a={isGIF}>
                    GIF
                </div>
            </div>
        {/if}

        {#if isGIF}
            <GIFPicker />
        {/if}



        {#if !isGIF}
        <div class="header">
            <div class="search pt3 ph3 pb2">
                <input bind:this={searchInput} 
                    bind:value={query}
                    on:keydown={filterEmoji}
                    placeholder={placeholder} />
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


                {#if filtering}
                        <div class="mt1 fl fl-co">
                            <div class="con">
                                {#each filtered as item (item.hexcode)}
                                    <li class="emoji-item grd" 
                                        on:click={selectEmoji(item)}>
                                        <div class="emoji-key"
                                        alt={item.unicode}
                                        title={item.shortcode}>
                                            {@html item.unicode}
                                        </div>
                                    </li>
                                {/each}
                            </div>
                        </div>
                {/if}


                {#if !filtering}


                {#if space_emoji?.length > 0}
                    {#each space_emoji as space}
                        {#if space?.emoji?.length > 0}

                        <div id="em-{space.alias}" 
                            class:disable={space_alias != space.alias}
                            class="fl fl-co mb2">
                            <div id="title-{space.alias}" 
                                class="emoji-title fl">
                                <div class="tt ml1 grd-c">
                                    {space.alias}
                                </div>
                            </div>
                            <div class="con">
                                {#each space.emoji as item (item.url)}
                                    <div class="grd-c custom-emoji-key emoji-item cei grd"
                                        url={item.url}
                                        title={`:${item.name}:`}
                                        on:click={selectCustomEmoji(item)}>
                                        <div class="">
                                            <img class="custom" 
                                            src={item.url} />
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        {/if}
                    {/each}
                {/if}



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
                                        <div class="emoji-item grd-c grd emoji-key"
                                            alt={item.unicode}
                                            title={item.shortcode}
                                            on:click={selectEmoji(item)}>
                                            <div class="emoji-key"
                                            alt={item.unicode}
                                            title={item.shortcode}>
                                                {@html item.unicode}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                {/if}

                </div>


                <div class="emoji-preview fl">
                    <div class="grd-c ml2 hov-e">
                        {#if hoveredEmojiIsCustom}
                            <img height="28" width="28"
                                src={hoveredEmoji} />
                        {:else}
                            {hoveredEmoji} 
                        {/if}
                    </div>
                    <div class="hov-s ml2 grd-c fl-o">
                        {hoveredShortcode}
                    </div>
                </div>

            </div>

        </div>
        {/if}


    </div>
</div>


<style>
.inactive {
    display: none;
    pointer-events: none!important;
}

.em-root {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 9999999;
}

.emoji-picker {
    position: absolute;
    pointer-events: auto;
    overflow: hidden;
    height: 500px;
    width: 410px;
    background: var(--emoji-picker);
    border-radius: 8px;
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow: 0px 1px 20px -5px rgba(0,0,0,0.1);
}

.chat {
    grid-template-rows: auto auto 1fr;
}

.left {
    top: var(--top);
    right: var(--right);
}

.right {
    top: var(--top);
    left: var(--left);
}



.header {
    border-bottom: 2px solid var(--border-1);
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
    border-right: 2px solid var(--border-1);
}

.cat {
    height: 20px;
    width: 20px;
    filter: grayscale(1);
    border-radius: 4px;
    cursor: pointer;
    transition: 0.1s;
}
.disable {
    filter: grayscale(1);
    pointer-events: none;
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

.cei {
    padding: 0.4rem;
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

.custom {
    width: 20px;
    height: 20px;
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
    padding: 0.5rem;
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
    font-weight: 500;
    font-size: 1rem;
}

.tab-nav {
    margin-top: 1rem;
    margin-left: 1rem;
}

.tn-item{
    padding: 0.4rem 0.6rem;
    background: var(--shade-3);
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    font-size: small;
}

.tn-item:hover {
    background: var(--shade-4);
}

.tn-a {
    background: var(--shade-4);
}

@media (max-width: 768px) {


}
</style>
