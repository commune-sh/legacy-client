<script>
import { onMount, createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

let kill =() => {
    dispatch('kill', true)
}

let usernameInput;

onMount(() => {
    usernameInput.focus();
});

function login() {
    dispatch('login', true)
}

</script>


<div class="b" >
    <div class="" >
    </div>
    <div class="" >
        <input bind:this={usernameInput} 
            type="text" placeholder="Username or Email" />
    </div>
    <div class="grd">
        <div class="grd-c">
            <button on:click={login}>Log In</button>
        </div>
    </div>
</div>

<style>
.b {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [header] 40px [content] 1fr [footer] 40px;
    place-self: stretch;
    height: 100%;
}
</style>
