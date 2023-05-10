<script>
import { page } from '$app/stores';
export let state;
export let type = 'space';

$: space = $page.params.space

export let isStatic = false;
export let name = '';

</script>

{#if isStatic && name}
    <div class="header">
        <div class="name grd-c">
            <span class="n">{name}</span>
        </div>
    </div>

{:else}

<div class="header">
    <div class="name grd-c">
        <span class="n">{state?.space?.name}</span>
    </div>
</div>
{/if}

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    position: sticky;
    z-index: 1;
    top: 0;
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto;
}

.name {
    padding-left: 1rem;
    padding-right: 1rem;
}

.n {
    font-weight: bold;
    font-size: 1rem;
}
</style>
