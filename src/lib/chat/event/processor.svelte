<script>
import Event from '$lib/chat/event/event.svelte'
import Memberships from '$lib/chat/event/membership/memberships.svelte'
import Topic from '$lib/chat/event/topic/topic.svelte'

export let event;
export let messages;
export let index;

</script>

{#if event?.type === 'm.room.message'}
    <Event 
        on:mounted
        isChat={true}
        index={index}
        on:replyTo
        on:reacted
        on:redact
        messages={messages}
        on:focus-reply
        event={event} 
        on:saved
        sender={null} />
{/if}

{#if event?.type === 'm.room.members'}
        <Memberships
        memberships={event}/>
{/if}
{#if event?.type === 'm.room.topic'}
    <Topic event={event}/>
{/if}
{#if event?.type === 'space.board.post'}
    <Event 
        isChat={true}
        isBoardPostInChat={true}
        on:replyTo
        on:reacted
        on:redact
        messages={messages}
        event={event} 
        on:saved
        sender={null} />
{/if}

