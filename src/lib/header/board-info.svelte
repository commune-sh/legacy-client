<script>
import { PUBLIC_BASE_URL } from '$env/static/public';
import { page } from '$app/stores';
import { onMount, createEventDispatcher } from 'svelte'
import { copyToClipboard } from '$lib/utils/utils.js'
import { down, clipboard, feed} from '$lib/assets/icons.js'
export let item;
import tippy from 'tippy.js';

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

function copyID() {
    copyToClipboard(item.room_id)
    copied = true
}

function buildURL(item) {
    let url = ``
    if(item?.alias == '') {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}`
    } else {
        url = `${PUBLIC_BASE_URL}/${$page.params.space}/${item?.alias}`
    }
    if($page.params.topic) {
        url = `${url}/topic/${$page.params.topic}`
    }
    return url = `${url}/rss`
}


function openFeed() {
    kill()
    window.open(feedURL, '_blank')
}

$: feedURL = buildURL(item)

$: isRoom = $page?.params?.room != undefined

$: name = (isMobile && !isRoom) ? $page.params.space : item?.name

</script>

<div class="item"
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
    <div class="content pa2 fl-co">

        <div class="rid it pa2" on:click={copyID}>
            <div class="in fl-co">
                <div class="label">
                    matrix room id
                </div>
                <div class="mt2 tx">
                    {item?.room_id}
                </div>
            </div>
            <div class="ico-s grd-c mh2" class:copied={copied}>
                {@html clipboard}
            </div>
        </div>

        <div class="rid it pa2" on:click={openFeed}>
            <div class="in fl-co">
                <div class="label">
                    rss feed
                </div>
                <div class="mt2 tx">
                    {feedURL}
                </div>
            </div>
            <div class="ico-s grd-c mh2">
                {@html feed}
            </div>
        </div>


    </div>
</div>

<style>
.name {
    font-weight: 500;
}
.menu {
    width: 300px;
    max-height: 400px;
    z-index: 901;
    border-radius: 9px;
    background-color: var(--context-menu-bg);
    display: grid;
    overflow: hidden;
}

.item {
    display: grid;
    grid-template-columns: 1fr auto;
    border-radius: 5px;
    background: var(--shade-3);
    cursor: pointer;
    overflow: hidden;
}

.content {
    overflow: hidden;
}

.in {
    overflow: hidden;
}

.item:hover {
    background: var(--shade-4);
}

.ac {
    background: var(--shade-4);
}

.ico-s {
    height: 16px;
    width: 16px;
}

.it {
    border-radius: 5px;
    cursor: pointer;
}

.it:hover {
    background: var(--shade-4);
}

.rid {
    display: grid;
    grid-template-columns: 1fr auto;
    overflow: hidden;
}

.copied {
    fill: var(--primary);
}

.tx {
    font-weight: 400;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: normal;
}

</style>
