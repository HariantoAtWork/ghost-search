import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import calendar from 'dayjs/plugin/calendar'
dayjs.extend(calendar)

export default dayjs
