<script>
import Login from '$lib/auth/login.svelte'
import { goto } from '$app/navigation';

function signup() {
    goto(`/signup`, {
        noscroll: true,
    })
}
</script>

<section class="login">
    <Login on:signup={signup}/>
</section>

<style>
.login {
    width: 100%;
    height: 100%;
    display: grid;
}
</style>
