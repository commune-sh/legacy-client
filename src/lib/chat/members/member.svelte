<script>
import User from '$lib/board/event/user/user.svelte'
import { getLocalpart} from '$lib/utils/utils.js'

export let member;


$: username = getLocalpart(member.user_id);

$: name = member?.display_name ? member.display_name : username;

$: user = {
    avatar_url: member?.avatar_url,
    display_name: member?.display_name,
    id: member?.user_id,
    username: username,
}


</script>

<div class="member">
    <User {user} list={true} />
</div>

<style>
.member {
    cursor: pointer;
    border-radius: 5px;
}
.member:hover {
    background: var(--event-bg-hover);
}
</style>
