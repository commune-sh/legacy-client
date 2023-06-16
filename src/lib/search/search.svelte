<script>
import { search as searchIcon} from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { page } from '$app/stores';
import { searchEvents } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import Event from '$lib/event/event.svelte'

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
    setTimeout(() => {
        //focused = false
    }, 100)
}

let searchInput;
let query;

$: active = query?.length > 0 || focused

function search () {
    results = null;
    results = results
    fetched = false
    debounce(doSearch, 200)
}

let results = null;

let fetched = false;

async function doSearch() {
    if(query == null || query.length < 1) return
    const res = await searchEvents({
        room_id: roomID,
        query: query,
    })
    console.log(res)
    if(res?.results?.length > 0) {
        results = res.results
        results = results
    }
    fetched = true
}


$: showResults = query?.length > 0 && focused

function kill() {
    query = ''
    results = null;
    results = results
    fetched = false
}
</script>


<div class="search-container mr2">
    <input class="Search" 
        bind:this={searchInput}
        bind:value={query}
        class:ex={active}
        on:focus={focus}
        on:input={search}
        spellcheck="false"
        on:blur={blur}
        placeholder="search"/>
    <div class="ico-s">
        {@html searchIcon}
    </div>

    {#if showResults}
        <div class="results fl-co">
            <div class="te sm pa3">
                <span class="label">Searching for:</span> <b>{query}</b>
            </div>
            <div class="events">
                {#if results?.length > 0}
                    {#each results as result}
                        <div class="event-item" on:click={kill}>
                            <Event 
                            event={result} 
                            search={true}
                            interactive={false}/>
                        </div>
                    {/each}
                {:else if fetched}
                    <div class="te sm pa3">
                        Nothing found...
                    </div>
                {/if}
            </div>
        </div>
    {/if}

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

.results {
    overflow: hidden;
    width: 300px;
    background: var(--shade-2);
    position: absolute;
    top: 2rem;
    right: 0;
    border-radius: 4px;
    box-shadow: 0 0 0 1px var(--shade-3);
    z-index: 100;
}

.events {
    overflow-y: auto;
    max-height: 300px;
}
</style>
