<script>
import { onMount, onDestroy } from 'svelte'
import { APIRequest, getNotifications } from '$lib/utils/request.js'
import { PUBLIC_API_URL, PUBLIC_API_URL_WS } from '$env/static/public';
import Login from './login.svelte'
import { close } from '$lib/assets/icons.js'
import { page } from '$app/stores';
import Signup from './signup.svelte'
import Password from './password.svelte'
import { store } from '$lib/store/store.js'

let active = false;


onMount(() => {

    const token = localStorage.getItem('access_token')
    if(token) {
        syncCreds(token)
    } else {
        store.verifiedSession(true)
    }

});

onDestroy(() => {
});

let syncCreds = (token) => {
    if(token) {

        APIRequest({
            url: `${PUBLIC_API_URL}/account/session`,
        })
          .then(resp => {

            if(resp?.valid && resp?.credentials) {
                store.saveCredentials(resp.credentials)
                store.saveRooms(resp.rooms)
                store.saveSpaces(resp.spaces)
                store.isAuthenticated()
                store.verifiedSession(true)
                store.spacesFetched()
            } else {
                localStorage.removeItem('access_token')
                store.verifiedSession(true)
            }

          })
          .catch(error => {
            console.error('Error:', error);
          });
    }
}

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: if(authenticated) {
    fetchNotifications()
    syncNotifications()
}

function syncNotifications() {
  let reconnectDelay = 1000; // Initial reconnect delay in milliseconds
  let maxReconnectDelay = 60000; // Maximum reconnect delay in milliseconds
  let reconnectTimer; // Timer for the reconnect delay

  function scheduleReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    reconnectTimer = setTimeout(function () {
      console.log("Reconnecting to WebSocket server...");
      syncNotifications();
    }, reconnectDelay);

    reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
  }

    let token = $store.credentials.access_token
    const socket = new WebSocket(`${PUBLIC_API_URL_WS}/account/notifications/sync?token=${token}`);
    console.log("syncing notifications")

  socket.onopen = function () {
    console.log("Connected to WebSocket server");
    reconnectDelay = 1000; // Reset reconnect delay upon successful connection
  };

  socket.onmessage = function (event) {
    if(event?.data && event?.data != 'ping') {
        let data = JSON.parse(event.data)
        store.addNotification(data)
    }
  };

  socket.onclose = function (event) {
    console.log("WebSocket connection closed:", event.reason);
    scheduleReconnect();
  };

  socket.onerror = function (error) {
    console.log("WebSocket error:", error);
    scheduleReconnect();
  };

    setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send('ping');
      }
    }, 30000);
}


async function fetchNotifications() {
    const res = await getNotifications();
    console.log(res)
    if(res?.notifications?.length > 0) {
        $store.notifications = res.notifications
    }
}


let kill =() => {
    active = false;
    store.stopAuthenticating()
}

$: authenticating = $store.authenticating?.active && $store.authenticating?.mode

$: if(authenticating) {
    active = true
} else {
    active = false
}

$: if(active) {
    document.addEventListener('keydown', escape)
    //document.body.style.overflowY = 'hidden'
    //document.body.style.marginRight = '10px'
} else {
    document.removeEventListener('keydown', escape)
    //document.body.style.overflowY = 'scroll'
    //document.body.style.marginRight = '0px'
    store.stopAuthenticating()
    mode = "login"
}

function escape(e) {
    if(e.key == 'Escape') {
        //kill()
    }
}



$: mode = $store.authenticating?.mode

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

function loggedin() {
    $store.reloadFeed = true
    kill()
}

function created() {
    $store.accountCreated = true
    kill()
    $store.discoverSpacesOpen = true
}

</script>


{#if active}
<div class="mask grd" 
    on:click|self={kill}>

    <div class="modal grd-c">

        <div class="hed fl">
            <div class="c-ico grd-c pa2" on:click={kill}>
                {@html close}
            </div>
        </div>

        {#if loginMode}
            <Login 
                on:signup={toggleMode} 
                on:authenticated={loggedin}
                on:resetPass={passMode}/>
        {:else if signupMode}
            <Signup on:created={created} on:login={toggleMode}/>
        {:else if passwordMode}
            <Password on:kill={toggleMode}/>
        {/if}

    </div>

</div>
{/if}

<style>
.modal {
    grid-template-rows: [header] auto [content] 1fr;
}
</style>
