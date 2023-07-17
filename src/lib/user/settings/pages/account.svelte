<script>
import { PUBLIC_MEDIA_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { createEventDispatcher } from 'svelte'
import { onMount, tick} from 'svelte'
import { addImage } from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Avatar from '$lib/components/avatar/avatar.svelte'
import { createStateEvent, updateAvatar, updateDisplayName } from '$lib/utils/request.js'
import Email from './email.svelte'
import Password from './password.svelte'

const dispatch = createEventDispatcher()


onMount(() => {
})

</script>

<div class="sco grd-c fl-co">
    <Email />
    <Password />
</div>

<style>

.sco {
    background: var(--modal);
    width: 100%;
    border-radius: 7px;
}

.header {
    background: var(--bg);
    border-radius: 7px;
    cursor: pointer;
}
.header:hover .c-ico {
    opacity: 1;
}

.banner {
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 1rem;
}


input, textarea {
    padding: 0.5rem;
    width: 100%;
}

textarea {
    height: 100px;
}

#age {
    width: 70px;
    padding: 0.25rem;
}

#ver {
    padding: 0;
    width: auto;
    cursor: pointer;
}

@media (max-width: 1020px) {
}
</style>

