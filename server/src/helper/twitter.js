import { tall } from 'tall';

export function validTwitterStatusUrl(url) {
    if (typeof url === 'string' || url instanceof String) {
        url = url.trim();
        var re = new RegExp('(http(?:s)?:\/\/)?(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+)');
        return re.test(url);
    }
    return false;
}

export async function expandtcoUrl(url) {
    try {
        const expandedUrl = await tall(url, { maxRedirects: 1 });
        return expandedUrl;
    } catch (err) {
        console.error('Error while expanding url', err);
        return null;
    }
}
