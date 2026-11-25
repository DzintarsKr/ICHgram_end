const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
];
export function formatRelativeTime(iso, now = Date.now()) {
    const diffSeconds = (new Date(iso).getTime() - now) / 1000;
    for (const [unit, seconds] of UNITS) {
        if (Math.abs(diffSeconds) >= seconds) {
            return rtf.format(Math.round(diffSeconds / seconds), unit);
        }
    }
    return "just now";
}

export default formatRelativeTime;
