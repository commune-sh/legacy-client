<script>
import { createEventDispatcher } from 'svelte'
import { store } from '$lib/store/store.js'
import { page } from '$app/stores';
import Reaction from './reaction.svelte'
import React from '$lib/board/event/tools/react.svelte'
import { savePost, redactReaction } from '$lib/utils/request.js'
import { isSafari } from '$lib/utils/utils.js'

const dispatch = createEventDispatcher()

export let event;
export let isReply;
export let hovered;

export let postEventID = null;

$: authenticated = $store?.authenticated && 
    $store?.credentials != null
    $store?.credentials?.access_token?.length > 0

$: sender= $store.credentials?.matrix_user_id

$: unprocessed = event?.reactions?.sort((a,b) => b?.senders?.length - a?.senders?.length)

$: processed = unprocessed?.filter(x => !x?.key?.startsWith("tag:"))

$: tags = event?.reactions?.filter(x => x?.key?.startsWith("tag:"))

$: ml = processed?.length > 0

$: selectedEmoji = $store.emojiPicker.selected

$: emojiSelected = $store.emojiPicker.reacting_to == event?.event_id &&
    selectedEmoji != null &&
    selectedEmoji != undefined

$: joinedRoom = authenticated && 
    $store?.rooms.find(x => x === event.room_id) != null 

export function process(key) {
    console.log("reacting with", key)

    if(!joinedRoom) {
        $store.alert = {
            active: true,
            message: `You'll need to join this board to react to this post.`
        }
        return
    }


    if(event?.reactions) {
        // check if reaction key exists
        let i = event?.reactions?.findIndex(r => r.key === key);
        console.log("does emoji exist?", i)
        // add sender if it does
        if (i !== -1) {
            // check if sender exists 
            let j = event?.reactions[i].senders.findIndex(s => s === sender);
            console.log("does sender exist?", j)
            if(j === -1) {
                // if it doesn't, add sender
                event?.reactions[i].senders.push(sender);
                saveReaction(key)
            } else {
                // if it does, remove sender
                console.log("removing sender")
                event?.reactions[i].senders.splice(j, 1);
                redact(key)
            }

            // if there are no senders, remove reaction
            if(event?.reactions[i].senders.length === 0) {
                event?.reactions.splice(i, 1);
            }
        // if not, add new reaction with sender
        } else {
            let newReaction = {
                key: key,
                senders: [sender]
            };

            event.reactions.push(newReaction);
            saveReaction(key)
        }
    } else {
        event.reactions = [
            {
                key: key,
                senders: [sender]
            }
        ]
        saveReaction(key)
        
    } 
    event.reactions = event.reactions
}

$: isReply = postEventID != null

async function saveReaction(key) {
    let post = {
        room_id: event.room_id,
        type: "m.reaction",
        reacting_to: event.event_id,
        content: {
            "m.relates_to": {
                "rel_type": "m.annotation",
                "event_id": event.event_id,
                "key": key,
            }
        },
    }

    if(isReply) {
        post.in_thread = postEventID
    } else {
        post.in_thread = event.event_id
    }

    const res = await savePost(post);
    console.log(res)
    dispatch('update-reactions', event)
}

async function redact(key) {
    let redaction = {
        room_id: event.room_id,
        event_id: event.event_id,
        key: key,
    }
    const res = await redactReaction(redaction);
    console.log(res)
    dispatch('update-reactions', event)
}

let skip = ['pinned', 'tagged']

$: state = $store?.states[$page?.params?.space]
$: bannedFromSpace = state?.banned === true

$: safari = isSafari()
</script>

{#if tags?.length > 0}
<div class="tags fl mr2" class:mt2={isReply}>
    {#each tags as reaction}
        <Reaction 
            isReply={isReply} 
            isTag={true}
            event={event} 
            on:react
            reaction={reaction} />
    {/each}
</div>
{/if}


{#if processed?.length > 0}
    <div class="reactions fl" class:mt2={isReply}>
        {#each processed as reaction}
            {#if !skip.includes(reaction.key)}
            <Reaction 
                isReply={isReply} 
                isTag={false}
                event={event} 
                on:react
                reaction={reaction} />
            {/if}
        {/each}
    {#if !safari && hovered && !bannedFromSpace}
    <div class="grd re" class:ml2={ml}>
        <React 
            isReply={isReply} 
            event={event} 
            inline={true} 
            on:react
            on:active/>
    </div>
    {/if}
</div>
{/if}


<style>
.reactions {
    min-height: 22px;
}
.re {
    height: 22px;
}
@media screen and (max-width: 1020px) {
    .reactions {
        height: 18px;
    }
}
</style>
