<script>
import '/static/css/main.css'
import { onMount } from 'svelte'
import Login from '$lib/auth/login.svelte'
import { APIRequest } from '$lib/utils/request.js'
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { goto } from '$app/navigation';
import { store } from '$lib/store/store.js'
import Health from '$lib/sync/health.svelte'

export let data;

$: if(data?.health) {
    $store.health = data.health
}

$: down = $store.down

function signup() {
    goto(`/signup`, {
        noscroll: true,
    })
}

function resetPass() {
    goto(`/password`, {
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
        url: `${PUBLIC_API_URL}/account/token`,
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

<Health />

{#if down}
<section class="down">
        <div class="grd-c">
    {PUBLIC_APP_NAME} is down right now. You will not be able to log in.
        Try again later.
        </div>
</section>
{/if}


{#if ready}
<section class="login">
    <div class="container grd-c">
            <Login on:authenticated={success} 
                on:resetPass={resetPass}
                on:signup={signup}/>
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
    background-color: var(--shade-3);
    padding-top: 2rem;
    border-radius: 9px;
}
@media screen and (max-width: 768px) {
    .container {
        width: 100%;
        height: 100%;
    }
}
</style>
