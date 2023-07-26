<script>
import MembershipEvent from './membership.svelte'
export let memberships;

function process(m) {
    let items = {join: [], leave: [], avatar: [], display_name: []};
    for (const event of m) {
        if (event?.unsigned?.prev_content?.avatar_url !==
                event?.content?.avatar_url) {
            items.avatar.push(event)
            break
        }
        if (event?.unsigned?.prev_content?.display_name !==
                event?.content?.display_name) {
            items.display_name.push(event)
            break
        }
        if(event?.content?.membership === 'join' && 
            !event?.unsigned?.prev_content) {
            items.join.push(event)
        }
        if(event?.content?.membership === 'leave' && 
            !event?.unsigned?.prev_content) {
            items.leave.push(event)
        }
    }

    return items
}

$: items = process(memberships?.events)

$: single = memberships?.events?.length === 1
$: multiple = memberships?.events?.length > 1
$: events = memberships?.events

let expanded = false;

function toggle() {
    expanded = !expanded;
}

</script>

{#if multiple}
    <div class="fl">
        <div class="fl-o">
            {#if !expanded}
                <div class="events mt1">
                    {memberships.events.length} membership changes
                </div>
            {/if}
        </div>
        <div class="mr3">
            <span class="toggle" on:click={toggle}>
                {expanded ? 'hide' : 'show all'}
            </span>
        </div>
    </div>
    {#if expanded}
        {#each events as event}
            <MembershipEvent
            event={event}/>
        {/each}
    {/if}
{:else if single}
    <MembershipEvent
    event={events[0]}/>
{/if}

<style>
.events {
    margin-left: calc( 30px + 2rem);
    font-size: 13px;
    color: var(--text-light);
}
.toggle {
    font-size: small;
    color: var(--primary);
    cursor: pointer;
}
</style>
