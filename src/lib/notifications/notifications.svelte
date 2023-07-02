<script>
import { page } from '$app/stores';
import { onMount, createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { user, bell } from '$lib/assets/icons.js'
import tippy from 'tippy.js';
import { readNotifications } from '$lib/utils/request.js'
import NotificationItem from './notification-item.svelte'

$: newItems = $store?.notifications?.some(n => !n.read);
$: items = $store?.notifications

const dispatch = createEventDispatcher();

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
        theme: 'notifications',
        placement: 'top',
        arrow: false,
        duration: 1,
        zIndex: 99999,
        onShown(i) {
            active = true
            dispatch('active', true)
        },
        onHide(i) {
            active = false
            read()
            dispatch('kill', true)
        },
        onClickOutside(i) {
            active = false
            dispatch('kill', true)
        },
    });
})


async function read() {
    if(!newItems) {
        return
    }
    $store.notifications.forEach(item => {
      item.read = true;
    });
    $store.notifications = $store.notifications;
    const res = await readNotifications();
    console.log(res)
}


function goToPost(e) {
    console.log(e.detail)
    menu.hide()
}

$: none = $store.notifications?.length == 0

</script>

<div class="grd-c pa2 mr1 bell"
    on:click|stopPropagation bind:this={el}>
    <div class="ico-s grd-c">
        {@html bell}
    </div>
    {#if newItems}
        <div class="dot">
        </div>
    {/if}
</div>

<div class="notifications" bind:this={content}>
    <div class="content">
        {#if none}
            <div class="grd-c">
                You don't have any notifications.
            </div>
        {/if}

        {#if !none && items}
        <div class="items">
            {#each items as item}
                <NotificationItem 
                    on:go={goToPost}
                    item={item} />
            {/each}
            </div>
        {/if}

    </div>
</div>




<style>

.notifications {
    width: 350px;
    max-height: 400px;
    min-height: 200px;
    z-index: 901;
    border-radius: 9px;
    background-color: var(--context-menu-bg);
    display: grid;
    overflow: hidden;
}

.content {
     display: grid;
    overflow-y: auto;
}

.bell {
    position: relative;
    opacity: 0.9;
    cursor: pointer;
    border-radius: 7px;
}

.bell:hover {
    background-color: var(--shade-4);
}


[data-tippy-root] {
    max-width: 300px;
}
</style>
