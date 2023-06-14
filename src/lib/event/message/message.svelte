<script>
export let event;
</script>

<div class="message pa3">
    <div class="event fl-co">
        {event.event_id} - {event.type} 
    </div>
    <div class="event fl-co">
        {JSON.stringify(event?.content)}
    </div>
</div>

<style>
.message {

}
</style>
