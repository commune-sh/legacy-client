import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(utc);
dayjs.utc()
dayjs.extend(tz)
dayjs.extend(relativeTime)


export function validAge(date, limit) {
  const createdDate = dayjs(date * 1000);
  const currentDate = dayjs();
  const daysAgo = currentDate.diff(createdDate, 'day');
  return daysAgo >= limit
}
