<script>
import { search as searchIcon} from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { page } from '$app/stores';
import { searchEvents } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'

$: state = $store?.states[$page?.params?.space]

$: roomID = isRoom ? state?.children?.find(r => r?.alias ===
    $page?.params?.room)?.room_id : isSpace ? state?.room_id : null

$: isSpace = $page?.params?.space !== undefined 
$: isRoom = $page?.params?.room !== undefined 
$: isPost = $page?.params?.post !== undefined
$: isTopic = $page?.params?.topic !== undefined
$: isDomain = $page?.params?.domain !== undefined

let focused = false
let focus = () => {
    focused = true
}
let blur = () => {
    focused = false
}

let searchInput;
let query;

$: active = query?.length > 0 || focused

function search () {
    debounce(doSearch, 500)
}

async function doSearch() {
    if(query == null || query.length < 1) return
    const res = await searchEvents({
        room_id: roomID,
        query: query,
    })
    console.log(res)
}

</script>


<div class="search-container mr2">
    <input class="Search" 
        bind:this={searchInput}
        bind:value={query}
        class:ex={active}
        on:focus={focus}
        on:keyup={search}
        spellcheck="false"
        on:blur={blur}
        placeholder="search"/>
    <div class="ico-s">
        {@html searchIcon}
    </div>

</div>

<style>
.search-container { 
    position: relative;
}

.ico-s {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    height: 14px;
    width: 14px;
}

input {
    background: var(--shade-2);
    border: none;
    border-radius: 4px;
    font-size: small;
    font-weight: bold;
    color: var(--text-light);
    padding-left: 0.5rem;
    padding-right: 1.5rem;
    width: 150px;
    transition: 0.1s;
}

.ex {
    width: 200px;
}
</style>
