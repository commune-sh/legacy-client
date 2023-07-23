<script>
import { PUBLIC_MEDIA_URL } from '$env/static/public';
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';

export let event;

$: user = event?.sender

$: avatarExists = user?.avatar_url !== undefined && 
    user?.avatar_url !== null && 
    user?.avatar_url !== '';

$: nameExists = user?.display_name !== undefined && 
    user?.display_name !== null && 
    user?.display_name !== '' &&
    user?.display_name !== user?.username;

$: initial = user?.username?.charAt(0).toUpperCase();

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: mediaURL = isDomain ? $store?.federated?.media_url : PUBLIC_MEDIA_URL
$: avatar = user?.avatar_url ? `${mediaURL}/${user?.avatar_url}` : null

$: isMXC = user?.avatar_url?.includes('mxc://')
$: stripped = user?.avatar_url?.replace('mxc://', '');
$: splitMXC = stripped?.split('/')
$: hs = splitMXC?.[0]
$: mediaID = splitMXC?.[1]
$: avatarIMG = isMXC ? `http://${hs}/_matrix/media/r0/thumbnail/${hs}/${mediaID}?width=96&height=96&method=crop` : avatar

$: state = event?.content?.membership
$: joined = state === 'join'
$: left = state === 'leave'
$: action = joined ? 'joined' : left ? 'left' : 'unknown'

</script>

<div class="membership fl">
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
            {user.display_name}
        {:else}
            {user.username}
        {/if}
        </span>
        {action} the room
    </div>
</div>


<style>
.membership {
    margin-top: 0.5rem;
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
</style>
