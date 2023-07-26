<script>
import { PUBLIC_MEDIA_URL, PUBLIC_MATRIX_SERVER_NAME } from '$env/static/public';
import { getHomeserver } from '$lib/utils/utils.js'
import { getAPIEndpoint } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

export let events;
export let event;
export let index;

$: user = event?.sender

$: avatarExists = event?.content?.avatar_url !== undefined && 
    event?.content?.avatar_url !== null && 
    event?.content?.avatar_url !== '';

$: nameExists = event?.content?.displayname !== undefined && 
    event?.content?.displayname !== null && 
    event?.content?.displayname !== '' &&
    event?.content?.displayname !== user?.username;

$: initial = user?.username?.charAt(0).toUpperCase();

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain && federated && domainIsHS ? $store?.federated?.media_url
    : isDomain && !domainIsHS && federated_media_url ? federated_media_url :
     !isDomain && federated && federated_media_url ? federated_media_url :
        PUBLIC_MEDIA_URL

$: domainIsHS = $page.params?.domain == homeserver

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
$: federated = !user?.id?.includes(PUBLIC_MATRIX_SERVER_NAME)

$: avatar = event?.content?.avatar_url ?
    `${mediaURL}/${event?.content?.avatar_url}` : null

$: isMXC = event?.content?.avatar_url?.includes('mxc://')
$: stripped = event?.content?.avatar_url?.replace('mxc://', '');
$: splitMXC = stripped?.split('/')
$: hs = splitMXC?.[0]
$: mediaID = splitMXC?.[1]
$: avatarIMG = isMXC ? `http://${hs}/_matrix/media/r0/thumbnail/${hs}/${mediaID}?width=96&height=96&method=crop` : avatar

$: state = event?.content?.membership
$: joined = state === 'join'
$: left = state === 'leave'
$: action = joined ? 'joined' : left ? 'left' : 'unknown'

$: hasPrevContent = event?.unsigned?.prev_content !== undefined 

$: isSameMembership = event?.unsigned?.prev_content?.membership ==
    event?.content?.membership

$: newAvatar = event?.unsigned?.prev_content?.avatar_url !==
    event?.content?.avatar_url

$: newName = event?.unsigned?.prev_content?.display_name !==
    event?.content?.displayname

function logEvent() {
    console.log(event)
}

</script>

<div class="membership fl" on:contextmenu={logEvent}>
    <div class="avatar grd"
        style="background-image: url({avatarIMG})">
            {#if !avatarExists}
                <div class="initials grd-c">
                {initial}
                </div>
            {/if}
    </div>
    <div class="">
        <span class="name">
        {#if nameExists}
            {event?.content?.displayname}
        {:else}
            {user.username}
        {/if}
        </span>
        <span class="action">
        {#if !hasPrevContent || !isSameMembership}
            {action} the room
        {:else if isSameMembership}
            {#if newAvatar}
                changed their profile picture
            {/if}
            {#if !newAvatar && newName}
                changed their name
            {/if}
        {/if}
        </span>
    </div>
</div>


<style>
.membership {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    margin-left: calc(30px + 2rem);
    font-size: 13px;
    color: var(--text-light);
}

.avatar {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: var(--avatar-bg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
.initials {
    font-size: 10px;
    font-weight: 500;
}
.name {
    font-weight: 500;
}
.action {
}
</style>
