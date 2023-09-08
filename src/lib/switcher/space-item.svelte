<script>
import { PUBLIC_MEDIA_URL, PUBLIC_MATRIX_SERVER_NAME } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { getAPIEndpoint } from '$lib/utils/request.js'
import { user } from '$lib/assets/icons.js'
import { isInViewport, getHomeserver } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import tippy from 'tippy.js';

const dispatch = createEventDispatcher()

export let container;
export let scrolling;

let el;
let content;

let menu;

onMount(() => {
    menu = tippy(el, {
        content: content,
        theme: 'light-border',
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
})

$: if(scrolling && menu) {
    menu.hide()
    hovered = false
}

export let space;

$: spacePath = $store?.spacePaths[space?.alias]?.pathname

$: initials = space?.initials?.toUpperCase()

$: homeserver = getHomeserver(space?.room_id)

$: federated = homeserver != PUBLIC_MATRIX_SERVER_NAME

$: if(federated) {
    fetchAPIEndpoint()
}

let federated_media_url;
async function fetchAPIEndpoint() {
    const endpoint = await getAPIEndpoint(homeserver)
    if(endpoint?.media_url) {
        federated_media_url = endpoint.media_url
    }
}

function goToSpace() {
    menu.hide()

    let url = `/${space?.alias}`

    /*
    if(spacePath) {
        url = spacePath
    }
    */

    if(federated) {
        url = `/${homeserver}/${space?.alias}`
    }

    goto(url, {noscroll: true})
}

let hovered = false;

$: federated_active = homeserver == $page.params?.domain &&
    $page.params?.space === space?.alias
$: local_active = $page.params?.space === space?.alias && !$page.params?.domain

$: active = federated ? federated_active : local_active

$: if(active && el) {
    isInViewport(el)
    .then(e => {
        if(!e) {
            el.scrollIntoView()
        }
    });
}

$: size = initials?.length > 2 ? '0.75rem' : initials?.length > 1 ? '0.85rem' : '1rem'

function log() {
    console.log(space)
}


$: mediaURL = federated && federated_media_url ? federated_media_url : PUBLIC_MEDIA_URL

$: avatar = space?.avatar?.length > 0 ? `${mediaURL}/${space?.avatar}` :
null

$: isProfile = space?.is_profile && space?.room_id ===
    $store?.credentials?.user_space_id

$: name = space?.name?.length > 0 ? space?.name : space?.alias

let dragging = false;

let initialX;
let initialY;

function dragStart(e) {
    initialX = e.clientX;
    initialY = e.clientY;
    dragging = true;
    e.dataTransfer.setData('text/plain', JSON.stringify(space));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
}

function dragEnd() {
    dragging = false;
}
function allowDrop(e) {
    e.preventDefault();
}
function drag(e) {
    if(e.clientY - initialY >= 30) {
        initialY = e.clientY
        dispatch('move-down', space.index)
    }
    if(initialY - e.clientY >= 30) {
        initialY = e.clientY
        dispatch('move-up', space.index)
    }
}

function drop(e) {
    e.preventDefault();
    const plain = e.dataTransfer.getData('text/plain');
    const data = JSON.parse(plain)

    console.log(data)
}


</script>

<div class="tip fl-co pa1" bind:this={content}>
    <div class="name">
        {name}
    </div>
    {#if space?.topic}
    <div class="sm mt2">
        {space?.topic}
    </div>
    {/if}
</div>

<div class="i-c grd"
    draggable="true"
    on:dragstart={dragStart}
    on:dragend={dragEnd}
    on:dragover={allowDrop}
    on:drag={drag}
    class:dhov={dragging}
    on:drop={drop}
>
    <div class="item grd-c"
    class:active={active}
    class:acf={active && !avatar}
    class:profile={isProfile}
    bind:this={el}
    on:contextmenu={log}
    on:mouseover={() => hovered = true}
    on:mouseleave={() => hovered = false}
    on:click={goToSpace}
    style="background-image: url({avatar})">
        {#if !avatar && !isProfile}
            <div class="initial grd-c" >
                <span class="name" style="font-size:{size};line-height:{size};">
                    {initials}
                </span>
            </div>
        {/if}
        {#if isProfile && !avatar}
            <div class="grd-c ico us">
                {@html user}
            </div>
        {/if}
    </div>
    <div class="tick" class:th={hovered} class:ac={active}></div>
</div>

<style>

.i-c {
    margin-bottom: 0.75rem;
    position: relative;
}

.item{
    background-color: var(--switcher-item);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: grid;
    cursor: pointer;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}

.profile {
    border-radius: 6px;
}

.initial {
    opacity: 0.8;
    font-size: var(--size);
}

.ico {
    height: 22px;
    width: 22px;
    fill: var(--text-light);
    opacity: 1;
}

.item:hover .ico {
    opacity: 1;
}

.active {
    color: white;
    fill: var(--text-1);
}

.acf {
    background-color: var(--primary);
}


.tick {
    opacity: 0;
    position: absolute;
    top: 10px;
    left: 0px;
    height: 15px;
    width: 4px;
    border-radius: 0 5px 5px 0;
    background-color: var(--switcher-pill);
}
.th {
    opacity: 1;
}

.ac {
    opacity: 1;
}

.name {
    font-weight: 500;
}
.sm {
    line-height: 1.5rem;
}
</style>
