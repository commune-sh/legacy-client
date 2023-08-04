<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { onMount, createEventDispatcher } from 'svelte'
import { down, check, hash } from '$lib/assets/icons.js'
import tippy from 'tippy.js';

export let items;
export let item;


let el;
let content;
let menu;
let active = false;

let copied = false;

$: if(!active) {
    setTimeout(() => {
        copied = false
    }, 100)
}

onMount(() => {
    menu = tippy(el, {
        content: content,
        allowHTML: true,
        trigger: 'click',
        interactive: true,
        theme: 'notifications',
        placement: 'bottom-start',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
        },
        onHide(i) {
            active = false
        },
        onClickOutside(i) {
            active = false
        },
    });
})

$: isMobile = window.innerWidth <= 768

function kill() {
    menu.hide()
}


$: isRoom = $page?.params?.room != undefined

$: name = (isMobile && !isRoom) ? $page.params.space : item?.name

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL


function avatar(item) {
    return item?.avatar ? `${mediaURL}/${item?.avatar}` : null
}


$: space = $page.params?.space
$: room = $page.params?.room
$: topic = $page.params?.topic
$: post = $page.params?.post

$: isGeneral = item?.general === true

function selected(item) {
    return (isGeneral && item.general && !topic) || 
    (room === item?.alias && !topic && !isGeneral)
}

function topicSelected(t) {
    return topic == t
}


function goToItem(item) {
    menu.hide()
    let url = `/`
    let alias = `/${item.alias}`
    if(item.general) {
        alias = ''
    }

    url = `/${space}${alias}`

    if(isDomain) {
        url = `/${$page.params.domain}/${space}${alias}`
    }

    goto(url, {
        noscroll: true,
    })

    if($store.menuToggled) {
        store.toggleMenu()
    }
}

function goToTopic(item, t) {
    menu.hide()
    let url = `/`
    let alias = `/${item.alias}`
    if(item.general) {
        alias = ''
    }

    url = `/${space}${alias}`

    if(isDomain) {
        url = `/${$page.params.domain}/${space}${alias}`
    }

    url = `${url}/topic/${t}`

    goto(url, {
        noscroll: true,
    })

    if($store.menuToggled) {
        store.toggleMenu()
    }
}

function initials(item) {
    if(!item?.alias) {
        return item?.name?.charAt(0).toUpperCase()
    }
    return item?.alias?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

function sortTopics (topics) {
    return topics?.sort((a, b) => a.localeCompare(b));
}

</script>

<div class="board-list"
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    <div class="name grd-c pl2 pv1">
        {name}
    </div>
    <div class="ico-s grd-c mh1">
        {@html down}
    </div>
</div>

<div class="menu" bind:this={content}>
    <div class="content pa1 fl-co">

        {#each items as item}
            <div class="item pa2" on:click={e => goToItem(item)}>
                <div class="ico grd-c img grd"
                    class:inactive={!active}
                    style="background-image: url({avatar(item)})">
                    {#if !avatar(item)}
                        <div class="init grd-c">
                            {initials(item)}
                        </div>
                    {/if}

                </div>
                <div class="ml2 name">
                    {#if item.general}
                        {#if isMobile}
                            {space}
                        {:else}
                            {item.name}
                        {/if}
                    {:else}
                        {item.name}
                    {/if}
                </div>
                {#if selected(item)}
                    <div class="ico-s grd-c">
                        {@html check}
                    </div>
                {/if}
            </div>

            {#if item?.topics}
                {#each sortTopics(item.topics) as topic}
                    <div class="item pa2" 
                        on:click={e => goToTopic(item, topic)}>
                        <div class="hash ico-s grd-c ml3">
                            {@html hash}
                        </div>
                        <div class="ml2 name">
                            {topic}
                        </div>
                        {#if topicSelected(topic)}
                            <div class="ico-s grd-c">
                                {@html check}
                            </div>
                        {/if}
                    </div>
                {/each}
            {/if}

        {/each}


    </div>
</div>

<style>
.board-list {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: 5px;
    background: var(--shade-3);
    cursor: pointer;
    overflow: hidden;
    font-weight: 500;
    color: var(--text-light);
}

.name {
    font-size: small;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}

.menu {
    width: 200px;
    z-index: 901;
    border-radius: 9px;
    background-color: var(--context-menu-bg);
    display: grid;
    overflow: hidden;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    border-radius: 5px;
    cursor: pointer;
}

.content {
    overflow-y: auto;
    max-height: 400px;
}

.in {
    overflow: hidden;
}

.item:hover {
    background: var(--shade-4);
}
.board-list:hover {
    background: var(--shade-4);
}


.ac {
    background: var(--shade-4);
}

.ico-s {
    height: 16px;
    width: 16px;
}

.img {
    background: var(--shade-4);
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    height: 16px;
    width: 16px;
}

.di {
    height: 16px;
    width: 16px;
}




::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}
.init {
    font-size: 10px;
    font-weight: 500;
}
.hash {
    height: 12px;
    width: 12px;
}

@media screen and (max-width: 768px) {
    .board-list {
        margin-left: 0.5rem;
    }
}
</style>
