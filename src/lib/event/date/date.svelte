<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(utc);
dayjs.extend(tz)
dayjs.extend(relativeTime)

export let date;

$: isToday = dayjs().isSame(dayjs(date), 'day')
$: when = dayjs(date)?.fromNow(true)
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
