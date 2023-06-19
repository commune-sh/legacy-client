<script>
import { up, down, settings, bell, lock, roles } from '$lib/assets/icons.js'
import SidebarItem from './sidebar-item.svelte'

let collapsed = false;

let items = [
    {
        name: 'general',
        alias: undefined,
        icon: settings,
        path: '',
    },
    {
        name: 'privacy',
        alias: 'privacy',
        icon: lock,
        path: 'privacy',
    },
    {
        name: 'notifications',
        alias: 'notifications',
        icon: bell,
        path: 'notifications',
    },
    {
        name: 'roles & permissions',
        alias: 'roles',
        icon: roles,
        path: 'roles',
    }
]


</script>

<div class="fl mb2">
    <div class="brds grd-c fl">
        <div class="grd-c ico-s mr1">
            {#if collapsed}
                {@html up}
            {:else}
                {@html down}
            {/if}
        </div>
        <div class="fl grd-c">
            <div class="label">settings</div>
        </div>
    </div>
</div>

<div class="items mb3">
    {#each items as item}
        <SidebarItem {item} />
    {/each}
</div>

<style>
.brds {
    opacity: 0.9;
}

.brds:hover {
    opacity: 1;
}

.label {
    color: var(--text-light);
    cursor: pointer;
}
.ico-s {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.set {
    width: 18px;
    height: 18px;
}
</style>

