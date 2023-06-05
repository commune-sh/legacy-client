<script>
import { page } from '$app/stores';

$: pagename = $page.params.page
</script>

{pagename}
