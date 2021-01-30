export function validTwitterStatusUrl(url) {
    if (typeof url === 'string' || url instanceof String) {
        url = url.trim();
        var re = new RegExp('(http(?:s)?:\/\/)?(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+)');
        return re.test(url);
    }
    return false;
}
