<script>
import { user as icon} from '$lib/assets/icons.js'

export let user;
export let op;
export let hideAvatar = false;

$: avatarExists = user?.avatar !== undefined && 
    user?.avatar !== null && 
    user?.avatar !== '';

$: nameExists = user?.display_name !== undefined && 
    user?.display_name !== null && 
    user?.display_name !== '' &&
    user?.display_name !== user?.username;

$: initial = user?.username?.charAt(0).toUpperCase();

</script>

<a class="user grd-c" href={`/@${user?.username}`}>
<div class="fl">
    {#if !hideAvatar}
        <div class="grd">
            <div class="grd-c avatar-base grd">
                {#if !avatarExists}
                    <div class="dn grd-c">
                        <b>{initial}</b>
                    </div>
                {:else}
                {/if}
            </div>
        </div>
    {/if}
        <div class="name grd-c ml1" class:op={op} class:ml1={!hideAvatar}>
            {#if nameExists}
                {user.display_name}
            {:else}
                {user.username}
            {/if}
    </div>
</div>
</a>

<style>
.user {
    font-size: small;
    font-weight: bold;
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
    background-color: var(--avatar-bg);
}

.dn {
    opacity: 0.7;
}

.name {
    color: var(--text-light);
}

a {
    text-decoration: none;
    color: var(--fg);
}
</style>
