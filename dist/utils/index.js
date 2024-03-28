export function w3cDate(date) {
    let result = new Date();
    if (typeof date === "number" || typeof date === "string") {
        result = new Date(date);
    }
    const str = result.toISOString();
    return str.substr(0, str.length - 5) + "Z";
}
