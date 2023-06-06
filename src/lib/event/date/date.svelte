<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

export let date;

$: isToday = dayjs().isSame(dayjs(date), 'day')
$: dayjsr = dayjs.extend(relativeTime)
$: when = dayjsr(date)?.fromNow(true)
$: created = dayjs(date)?.format('MMM D')


$: title = isToday ? when : created

</script>

<div class="time grd-c" title={title}>
    {isToday ? when : created}
</div>

<style>
.time {
    font-size: small;
    color: var(--text-light);
}
</style>
