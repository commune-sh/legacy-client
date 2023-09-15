<script>
import { PUBLIC_API_URL } from '$env/static/public';
import { onMount } from 'svelte'
import { ListUsers } from '$lib/utils/request.js'

export let data;

$: if(data) {
}

onMount(() => {
    fetchUsers();
})

async function fetchUsers() {
    const res = await ListUsers()
    console.log(res)
}

</script>

    ok
