<script>
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import { user} from '$lib/assets/icons.js'
import { getLocalpart} from '$lib/utils/utils.js'

export let member;


$: username = getLocalpart(member.user_id);

$: name = member?.display_name ? member.display_name : username;

</script>

<div class="member">
    {name}
</div>

<style>
.member {
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 5px;
}
.member:hover {
    background: var(--event-bg-hover);
}
</style>
