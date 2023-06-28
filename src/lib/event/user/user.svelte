<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { crown } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

export let user;
export let op;
export let hideAvatar = false;

$: avatarExists = user?.avatar_url !== undefined && 
    user?.avatar_url !== null && 
    user?.avatar_url !== '';

$: nameExists = user?.display_name !== undefined && 
    user?.display_name !== null && 
    user?.display_name !== '' &&
    user?.display_name !== user?.username;

$: initial = user?.username?.charAt(0).toUpperCase();

$: state = $store?.states[$page?.params?.space]
$: isOwner = state?.owner === user?.id
$: isSpaceAdmin = $store?.power_levels?.space?.[user?.id] == 100

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL

$: avatar = `${mediaURL}/${user?.avatar_url}`

</script>

<a class="user grd-c" href={`/@${user?.username}`}>
<div class="flc">
    {#if !hideAvatar}
        <div class="grd grd-c">
                {#if !avatarExists}
                    <div class="grd-c avatar-base grd">
                        <div class="dn grd-c">
                            <b>{initial}</b>
                        </div>
                    </div>
                {:else}
                    <div class="grd-c avatar-base grd"
                    style="background-image: url({avatar})">
                    </div>
                {/if}
        </div>
    {/if}
    <div class="name grd-c ml1" class:op={op} class:ml1={!hideAvatar}>
        {#if nameExists}
            {user.display_name}
        {:else}
            {user.username}
        {/if}
    </div>
    {#if isOwner && isSpaceAdmin}
        <div class="ico-s ml2 c1 grd-c" title="space owner">
            {@html crown}
        </div>
    {:else if isOwner && !isSpaceAdmin}
        <div class="ico-s ml2 c1 grd-c" title="space owner">
            {@html crown}
        </div>
    {:else if !isOwner && isSpaceAdmin}
        <div class="ico-s ml2 c2 grd-c" title="admin">
            {@html crown}
        </div>
    {/if}
        
</div>
</a>

<style>
.user {
    font-size: small;
    font-weight: bold;
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
    width: 18px;
    height: 18px;
    border-radius: 50%;
    margin-right: 2px;
    background-color: var(--avatar-bg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.dn {
    opacity: 0.7;
}

.name {
    color: var(--text-light);
    line-height: 1;
}

a {
    text-decoration: none;
    color: var(--fg);
}

.ico-s {
    width: 13px;
    height: 13px;
}

.c1 {
    opacity: 0.5;
}
</style>
