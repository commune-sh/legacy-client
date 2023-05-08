<script>
import { onMount, createEventDispatcher } from 'svelte'
import Login from './login.svelte'
import Signup from './signup.svelte'
import Password from './password.svelte'

const dispatch = createEventDispatcher()

let kill =() => {
    dispatch('kill', true)
}

onMount(() => {
    function handleKeyPress(e) {
      if (e.key === 'Escape') {
        dispatch('kill', true)
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
});

export let mode = "login";

$: loginMode = mode === "login";
$: signupMode = mode === "signup";
$: passwordMode = mode === "pass";

function toggleMode() {
    if (loginMode) {
        mode = "signup";
    } else if (signupMode) {
        mode = "login";
    } else if (passwordMode) {
        mode = "login";
    }
}
function passMode() {
    mode = "pass";
}
</script>

<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c">

        <div class="hed fl">
            <div class="">

            </div>
        </div>

        {#if loginMode}
            <Login 
                on:signup={toggleMode} 
                on:authenticated 
                on:resetPass={passMode}/>
        {:else if signupMode}
            <Signup on:login={toggleMode}/>
        {:else if passwordMode}
            <Password on:kill={toggleMode}/>
        {/if}

    </div>

</div>

<style>
.mask {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.modal {
    background-color: var(--modal);
    min-width: 100%;
    min-height: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: [header] 40px [content] 1fr;
}


</style>
