<script>
import { page } from '$app/stores';

export let event;

$: isDomain = $page.params.domain !== undefined && 
    $page.params.domain !== 'undefined' && 
    $page.params.domain?.length > 0

$: roomAlias = isDomain ? `${$page.params.domain}/${event?.room_alias}` :
    event?.room_alias

</script>

<div class="grd-c ml2">
    <a href={`/${roomAlias}`}>{event?.room_alias}</a>
</div>

