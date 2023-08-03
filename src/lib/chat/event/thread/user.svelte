<script>
import { PUBLIC_MEDIA_URL, PUBLIC_MATRIX_SERVER_NAME } from '$env/static/public';
import { getHomeserver } from '$lib/utils/utils.js'
import { getAPIEndpoint } from '$lib/utils/request.js'
import { crown } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import { store } from '$lib/store/store.js'

export let user;
export let op = false;
export let hideAvatar = false;
export let isChat = false;

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

//$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL
$: mediaURL = isDomain && federated && domainIsHS ? $store?.federated?.media_url
    : isDomain && !domainIsHS && federated_media_url ? federated_media_url :
     !isDomain && federated && federated_media_url ? federated_media_url :
        PUBLIC_MEDIA_URL

$: domainIsHS = $page.params?.domain == homeserver

$: avatar = user?.avatar_url ? `${mediaURL}/${user?.avatar_url}` : null

$: isMXC = user?.avatar_url?.includes('mxc://')
$: stripped = user?.avatar_url?.replace('mxc://', '');
$: splitMXC = stripped?.split('/')
$: hs = splitMXC?.[0]
$: mediaID = splitMXC?.[1]
$: avatarIMG = isMXC ? `http://${hs}/_matrix/media/r0/thumbnail/${hs}/${mediaID}?width=96&height=96&method=crop` : avatar

$: homeserver = getHomeserver(user?.id)

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

let el;

$: federated = !user?.id?.includes(PUBLIC_MATRIX_SERVER_NAME)

$: hs = getHomeserver(user?.id)

$: link = federated ? `https://${hs}/@${user?.username}` :
        `/@${user?.username}`

</script>


<a class="user grd-c" data-user={`@${user?.username}`} href={link}>
    <div class="flc" bind:this={el}>
    {#if !hideAvatar}
            <div class="grd-c avatar-base grd" class:ch={isChat}
            style="background-image: url({avatarIMG})">
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
    margin-right: 0.5rem;
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
