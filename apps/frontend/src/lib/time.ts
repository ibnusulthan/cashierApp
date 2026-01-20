import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const formatDuration = (startIso: string) => {
  const start = dayjs(startIso);
  const now = dayjs();
  const diff = dayjs.duration(now.diff(start));

  const hours = Math.floor(diff.asHours());
  const minutes = diff.minutes();
  const seconds = diff.seconds();

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
