<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { onMount, createEventDispatcher } from 'svelte'
import { crown } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

export let user;
export let op;
export let hideAvatar = false;
export let isChat;

$: avatarExists = user?.avatar_url !== undefined && 
    user?.avatar_url !== null && 
    user?.avatar_url !== '';

$: nameExists = user?.display_name !== undefined && 
    user?.display_name !== null && 
    user?.display_name !== '' &&
    user?.display_name !== user?.username;

$: initial = user?.username?.charAt(0).toUpperCase();

$: state = $store?.states[$page?.params?.space]
$: isOwner = state?.owner?.user_id === user?.id
$: isSpaceAdmin = $store?.power_levels?.space?.[user?.id] == 100

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL

$: avatar = `${mediaURL}/${user?.avatar_url}`

let el;
</script>


<a class="user grd-c" data-user={`@${user?.username}`} href={`/@${user?.username}`}>
    <div class="flc" bind:this={el}>
    {#if !hideAvatar}
            <div class="grd-c avatar-base grd" class:ch={isChat}
            style="background-image: url({avatar})">
                {#if !avatarExists}
                    <div class="initials grd-c">
                    {initial}
                    </div>
                {/if}
            </div>
    {/if}
    <div class="name grd-c" class:op={op}>
        {#if nameExists}
            {user.display_name}
        {:else}
            {user.username}
        {/if}
    </div>
    {#if isOwner && isSpaceAdmin}
        <div class="crown ico-s ml1 c1 grd-c" title="space owner">
            {@html crown}
        </div>
    {:else if isOwner && !isSpaceAdmin}
        <div class="crown ico-s ml1 c1 grd-c" title="space owner">
            {@html crown}
        </div>
    {:else if !isOwner && isSpaceAdmin}
        <div class="crown ico-s ml1 c2 grd-c" title="admin">
            {@html crown}
        </div>
    {/if}
        
</div>
</a>

<style>
.user {
    font-weight: 500;
}

.flc {
    display: grid;
    grid-template-columns: auto auto auto;
}

.op {
    background-color: var(--avatar-bg);
    border-radius: 4px;
    padding: 0rem 0.25rem;
    margin-left: -0.25rem;
}

.user:hover a:link{
    color: var(--primary);
}
a:hover {
    color: var(--primary);
}

.avatar-base {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 2px;
    background-color: var(--avatar-bg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.ch {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
}

@media screen and (max-width: 768px) {
    .avatar-base {
        width: 12px;
        height: 12px;
    }
    .ch {
        width: 30px;
        height: 30px;
    }
}

.name {
    color: var(--text-light);
    line-height: 1;
}

a:link, a:visited {
    text-decoration: none;
    color: var(--fg);
}

.ico-s {
    width: 13px;
    height: 13px;
}

.c1 {
}
.crown {
    opacity: 0.7;
}
.initials {
    font-size: 10px;
    font-weight: 500;
}
</style>
