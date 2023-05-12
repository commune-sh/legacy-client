<script>
import { createEventDispatcher } from 'svelte'
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import Logo from '../../components/logo/logo.svelte'

const dispatch = createEventDispatcher()

export let state;
export let type = 'space';

$: space = $page.params.space

export let isStatic = false;
export let name = '';

function goToSpace() {
    goto(`/${$page.params.space}`)
}

function newPost() {
    dispatch('newPost')
}

$: joined = state?.joined === true
</script>


<div class="header">
    <div class="container fl">
        <div class="logo grd-c">
            <Logo />
        </div>
        <div class="name grd-c">
            {#if isStatic && name}
                <span class="n">{name}</span>
            {:else}
                <span class="n" on:click={goToSpace}>{state?.space?.name}</span>
            {/if}
        </div>
        <div class="fl-o"></div>
        {#if joined}
        <div class="grd-c">
                <button class="" on:click={newPost}>New Post</button>
        </div>
        {/if}
    </div>
</div>

<style>
.header {
    border-bottom: 1px solid var(--border-1);
    position: sticky;
    z-index: 1;
    top: 0;
    background-color: var(--bg);
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
}

.logo {
    display: none;
    padding-left: 0.5rem;
}

@media screen and (max-width: 768px) {
    .header {
    }
    .logo {
        display: block;
    }
}
.name {
    padding-left: 1rem;
    padding-right: 1rem;
}

.n {
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
}
</style>
