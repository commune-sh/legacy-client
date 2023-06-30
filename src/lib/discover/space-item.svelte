<script>
import { onMount, createEventDispatcher } from 'svelte'
import { goto } from '$app/navigation';
import { PUBLIC_APP_NAME, PUBLIC_MEDIA_URL } from '$env/static/public';

const dispatch = createEventDispatcher()

$: header = space?.header ? `${PUBLIC_MEDIA_URL}/${space?.header}` : null
$: avatar = space?.avatar ? `${PUBLIC_MEDIA_URL}/${space?.avatar}` : null

export let space;

function goToSpace() {
    let url = `/${space.alias}`
    goto(url, {noscroll: true})
    dispatch('kill')
}

</script>

<div class="item pa2">
    <div class="space"
        on:click={goToSpace}>
        <div class="banner" 
            style="background-image: url({header})">
        </div>
        <div class="pa2 mt1 fl">
            <div class="snm fl-o">
                <a href={space.alias}>
                    {space.name ? space.name : space.alias}
                </a>
            </div>
            <div class="">
            </div>
        </div>
        <div class="ph2 mt1 mb3 sm desc">
            {#if space.topic}
                {space.topic}
            {:else}
                No description.
            {/if}
        </div>
    </div>
</div>

<style>
.space {
    background: var(--shade-2);
    border-radius: 7px;
    transition: 0.2s;
    display:grid;
    cursor: pointer;
    grid-template-rows: 100px 1fr;
    border: 1px solid var(--shade-2);
}

.banner {
    background: var(--bg);
    border-radius: 7px 7px 0 0 ;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}


.alias {
    background: var(--bg);
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    display: inline-block;
    transtion: 0.1s;
}

.space:hover{
    opacity: 0.9;
}

a, a:link, a:visited, a:active {
    text-decoration: none;
    color: var(--text);
}
.desc {
    color: var(--text-light);
}

.snm {
    font-weight: 500;
}
</style>
