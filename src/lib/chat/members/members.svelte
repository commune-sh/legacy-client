<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { user} from '$lib/assets/icons.js'
import Member from './member.svelte'

export let room_id;

$: members = $store.roomMembers[room_id];

</script>

<div class="room-members">
    {#if members}
        <div class="members">
        {#each members as member}
            <Member {member} />
        {/each}
        </div>
    {/if}
</div>

<style>
.room-members {
    overflow: hidden;
}
.members {
    overflow-y: auto;
    height: 100%;
    padding: 0.5rem;
}

::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.1s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.1s;
}
.members:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}
</style>
