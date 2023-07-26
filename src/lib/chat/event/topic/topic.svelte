<script>
import { PUBLIC_MEDIA_URL, PUBLIC_MATRIX_SERVER_NAME } from '$env/static/public';
import { getHomeserver } from '$lib/utils/utils.js'
import { getAPIEndpoint } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import { md } from '$lib/composer/md/md.js'

export let event;


$: avatarExists = event?.content?.avatar_url !== undefined && 
    event?.content?.avatar_url !== null && 
    event?.content?.avatar_url !== '';

$: nameExists = event?.content?.displayname !== undefined && 
    event?.content?.displayname !== null && 
    event?.content?.displayname !== '' &&
    event?.content?.displayname !== event?.sender?.username;

$: initial = event?.sender?.username?.charAt(0).toUpperCase();

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain && federated && domainIsHS ? $store?.federated?.media_url
    : isDomain && !domainIsHS && federated_media_url ? federated_media_url :
     !isDomain && federated && federated_media_url ? federated_media_url :
        PUBLIC_MEDIA_URL

$: domainIsHS = $page.params?.domain == homeserver

$: homeserver = getHomeserver(event?.sender?.id)

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
$: federated = !event?.sender?.id?.includes(PUBLIC_MATRIX_SERVER_NAME)

$: avatar = event?.content?.avatar_url ?
    `${mediaURL}/${event?.content?.avatar_url}` : null

$: isMXC = event?.content?.avatar_url?.includes('mxc://')
$: stripped = event?.content?.avatar_url?.replace('mxc://', '');
$: splitMXC = stripped?.split('/')
$: hs = splitMXC?.[0]
$: mediaID = splitMXC?.[1]
$: avatarIMG = isMXC ? `http://${hs}/_matrix/media/r0/thumbnail/${hs}/${mediaID}?width=96&height=96&method=crop` : avatar
</script>

<div class="topic fl">
    <div class="grd">
        <div class="avatar grd"
            style="background-image: url({avatarIMG})">
                {#if !avatarExists}
                    <div class="initials grd-c">
                    {initial}
                    </div>
                {/if}
        </div>
    </div>
    <div class="mr3">
        <span class="name">
        {#if nameExists}
            {event?.content?.displayname}
        {:else}
            {event?.sender?.username}
        {/if}
        </span>
        <span class="action">
            updated the room topic - <span class="bd">{@html md.render(event?.content?.topic)}</span>
        </span>
    </div>
</div>

<style>
.topic {
    margin-top: 0.25rem;
    margin-left: calc( 30px + 2rem);
    font-size: 13px;
    color: var(--text-light);
}
.avatar {
    margin-top: 3px;
    min-width: 14px;
    min-height: 14px;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: var(--avatar-bg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    justify-self: start;
    align-self: start;
}
.initials {
    font-size: 10px;
}
.name {
    font-weight: 500;
}

.bd {
    color: var(--text-1);
    line-height: 1.4;
}

div :global(p) {
    display: inline;
}

</style>
