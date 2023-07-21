<script>
import { getHomeserver } from '$lib/utils/utils.js'
import { PUBLIC_MATRIX_SERVER_NAME } from '$env/static/public';

export let event;

$: homeserver = getHomeserver(event?.room_id)

$: federated = homeserver != PUBLIC_MATRIX_SERVER_NAME

$: roomAlias = federated ? `${PUBLIC_MATRIX_SERVER_NAME}/${event?.room_alias}` :
    event?.room_alias

</script>

<div class="grd-c ml2">
    <a href={`/${roomAlias}`}>{event?.room_alias}</a>
</div>

