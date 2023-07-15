<script>
import { PUBLIC_BASE_URL, PUBLIC_MEDIA_URL } from '$env/static/public';
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import { onMount, createEventDispatcher } from 'svelte'
import { copyToClipboard } from '$lib/utils/utils.js'
import { info, clipboard, feed} from '$lib/assets/icons.js'
export let item;
import dayjs from 'dayjs'
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

$: state = $store?.states[$page?.params?.space]

$: members = state?.members

$: localpart = '@' + state?.owner?.user_id.split(':')[0].substring(1);
$: owner_id = state?.owner?.user_id

$: ownerSpace = `${PUBLIC_BASE_URL}/${localpart}`

$: name = state?.owner?.display_name ? state?.owner?.display_name : localpart

$: avatar = state?.owner?.avatar_url ?
    `${PUBLIC_MEDIA_URL}/${state?.owner?.avatar_url}` : null

$: created = dayjs(state?.origin_server_ts)?.format('MMM D YYYY')

$: boardTypeText = item?.is_profile ? 'Followers' : 'Members'

let stripHTTPS  = (url) => {
    return url.replace(/(^\w+:|^)\/\//, '');
}

$: room_alias = `#${$page.params.space}:${stripHTTPS(PUBLIC_BASE_URL)}`

</script>

<div class="item ml2"
    class:ac={active}
    on:click|stopPropagation bind:this={el}>
    <div class="ico-s grd-c mh1">
        {@html info}
    </div>
</div>

<div class="menu" bind:this={content}>
    <div class="content pa2 fl-co">

        <div class="rid pa2">
            <div class="in fl-co">
                <div class="label">
                    owner
                </div>
                <div class="mt2 tx">
                    <a href={ownerSpace}>
                        {name}
                    </a>
                </div>
            </div>
            {#if avatar}
                <div class="grd-c avatar-base grd"
                style="background-image: url({avatar})">
                </div>
            {/if}
        </div>

        <div class="rid pa2">
            <div class="in fl-co">
                <div class="label">
                    {boardTypeText}
                </div>
                <div class="mt2 tx">
                    {members}
                </div>
            </div>
        </div>

        <div class="rid pa2">
            <div class="in fl-co">
                <div class="label">
                    created
                </div>
                <div class="mt2 tx">
                    {created}
                </div>
            </div>
        </div>

        <div class="sep mv2">
        </div>

        {#if item.general}
        <div class="rid it pa2" on:click={copyID}>
            <div class="in fl-co">
                <div class="label">
                    matrix room alias
                    {#if copied}
                        <span class="cop">(copied)</span>
                    {/if}
                </div>
                <div class="mt2 tx">
                    {room_alias}
                </div>
            </div>
            <div class="ico-s grd-c mh2" class:copied={copied}>
                {@html clipboard}
            </div>
        </div>
        {/if}

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

.sep {
    height: 1px;
    background: var(--shade-4);
    border-radius: 2px;
    margin-left: 0.25rem;
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

.cop{
    color: var(--primary);
}

.avatar-base {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: var(--avatar-bg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
</style>
