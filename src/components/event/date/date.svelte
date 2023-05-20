<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

export let date;

$: isToday = dayjs().isSame(dayjs(date), 'day')
$: dayjsr = dayjs.extend(relativeTime)
$: when = dayjsr(date)?.fromNow(true)
$: created = dayjs(date)?.format('MMM D')

</script>

{#if isToday}
    <span class="time" title={when}>{when}</span>
{:else}
    <span class="time" title={created}>{created}</span>
{/if}

<style>
.time {
    font-size: small;
}
</style>
