<script>
import { page } from '$app/stores';

$: thread_slug = $page.url.searchParams.get('thread')
</script>

<div class="thread">
    {thread_slug}
</div>

<style>
.thread {

}
</style>
