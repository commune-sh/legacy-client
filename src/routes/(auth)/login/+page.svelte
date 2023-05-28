<script>
import { onMount } from 'svelte'
import Login from '$lib/auth/login.svelte'
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_BASE_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'


function signup() {
    goto(`/signup`, {
        noscroll: true,
    })
}

function success() {
    goto(`/`)
}

let ready = false;

onMount(() => {
    const token = localStorage.getItem('access_token')
    if(token) {
        validateToken()
    } else {
        ready = true
    }
})

let validateToken = () => {

    APIRequest({
        url: `${PUBLIC_BASE_URL}/account/token`,
    })
      .then(resp => {

        console.log('Response:', resp);
        if(resp?.valid) {
            success()
        }

      })
      .catch(error => {
        console.error('Error:', error);
        ready = true
      });
}

</script>

{#if ready}
<section class="login">
    <div class="container grd-c">
        <Login on:authenticated={success} on:signup={signup}/>
    </div>
</section>
{/if}

<style>
.login {
    width: 100%;
    height: 100%;
    display: grid;
}
.container {
    background-color: var(--bg);
    padding-top: 2rem;
    border-radius: 9px;
}
@media screen and (max-width: 768px) {
    .container {
        width: 100%;
    }
}
</style>
