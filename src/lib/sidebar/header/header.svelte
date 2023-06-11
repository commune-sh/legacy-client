<script>
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'
import SkeletonSpan from '$lib/skeleton/skeleton-span.svelte'

export let state;
export let ready;

$: name = state?.space?.name ? state.space.name : ``;

$: isStaticRoute = $store.staticRoutes.some(r => r.path === $page?.url?.pathname);
$: staticRoute = $store.staticRoutes.find(r => r.path === $page?.url?.pathname);

</script>

<div class="sidebar-header">
    <div class="in">
        {#if !ready}
            <SkeletonSpan />
        {:else}

            {#if isStaticRoute}
                <b>{staticRoute.name}</b>
            {:else}
                <b>{name}</b>
            {/if}
        {/if}
    </div>
</div>

<style>
.sidebar-header {
    display: grid;
    border-bottom: 1px solid var(--border-1);
    padding: 0.5rem;
}
.in {
    justify-self: start;
    align-self: center;
}
</style>
