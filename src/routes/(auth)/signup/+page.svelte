<script>
import Signup from '$lib/auth/signup.svelte'
import { goto } from '$app/navigation';

function login() {
    goto(`/login`, {
        noscroll: true,
    })
}
</script>

<section class="signup">
    <Signup on:login={login}/>
</section>

<style>
.signup {
    width: 100%;
    height: 100%;
    display: grid;
}
</style>
