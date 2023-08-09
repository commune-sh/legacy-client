<script>
import { search as searchIcon} from '$lib/assets/icons.js'
import { debounce } from '$lib/utils/utils.js'
import { page } from '$app/stores';
import { searchEvents } from '$lib/utils/request.js'
import { store } from '$lib/store/store.js'
import Event from '$lib/board/event/event.svelte'

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
        focused = false
    }, 200)
}

function focusInput() {
    searchInput.focus()
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
        room_id: roomID ? roomID : 'all',
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
    focused = false
    searchInput.blur()
}
function kd(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        kill()
    }
}
</script>


<div class="search-container">
    <div class="sec fl" on:click={focusInput}>
        <div class="scc fl-o">
            <input class="Search" 
                bind:this={searchInput}
                bind:value={query}
                class:ex={active}
                on:focus={focus}
                on:input={search}
                on:keydown={kd}
                spellcheck="false"
                on:blur={blur}
                placeholder="search"/>
        </div>

        <div class="grd-c ico-s ph1">
            {@html searchIcon}
        </div>
    </div>

    {#if showResults}
        <div class="results fl-co">
            <div class="te sm pa3">
                <span class="label">Searching for:</span> {query}
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
    background: var(--shade-2);
    border: none;
    border-radius: 4px;
    margin-left: 1rem;
}

.sec {
    cursor: text;
    height: 24px;
}

.ico-s {
    height: 14px;
    width: 14px;
}

input {
    margin: 0;
    padding: 0;
    padding-left: 0.5rem;
    background: var(--shade-2);
    border: none;
    border-radius: 4px;
    font-size: small;
    font-weight: 500;
    color: var(--text-light);
    transition: 0.1s;
    width: 120px;
}

@media screen and (max-width: 768px) {
    .scc {
        display: none;
    }
}

.ex {
    width: 160px;
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
