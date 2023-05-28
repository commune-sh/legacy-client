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
    <div class="container grd-c">
        <Signup on:login={login}/>
    </div>
</section>

<style>
.signup {
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
