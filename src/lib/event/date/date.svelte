<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'just now',
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
})

export let date;

$: isToday = dayjs().isSame(dayjs(date), 'day')
$: isThisWeek = dayjs().diff(dayjs(date), 'day') < 7
$: when = dayjs(date)?.fromNow(true)
$: created = dayjs(date)?.format('MMM D')


$: title = dayjs(date)?.format()

</script>

<div class="time grd-c" title={title}>
    {isThisWeek ? when : created}
</div>

<style>
.time {
    color: var(--text-light);
}
</style>
