import { promises as fs } from 'fs';
import Twitter from './tw_api.js';


async function getTwitterCredentials() {
    const keys = await fs.readFile('keys.json');
    const tw_credentails = JSON.parse(keys)['twitter'];
    return tw_credentails;
}

export async function getThreadTweetsForTweetId(tweet_id) {
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;
    const api = new Twitter(token);

    try {
        const tweet = await api.getTweetWithTweetId(tweet_id);
        const conversation_id = tweet.data[0].conversation_id;
        const rootTweet = conversation_id == tweet.data[0].id ? tweet : await api.getTweetWithTweetId(conversation_id);

        const username = rootTweet.includes.users[0].username;
        const replies = await api.searchUserTweetsWithConversationId(conversation_id, username);

        const fullThread = {
            "data": [...rootTweet.data || [], ...replies?.data?.reverse() || []],
            "includes": {
                "media": [...rootTweet.includes?.media || [], ...replies?.includes?.media?.reverse() || []],
                "users": [...rootTweet.includes?.users || [], ...replies?.includes?.users || []]
            },
            "replies_meta": replies?.meta
        };

        return fullThread;

    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getThreadTweetsForTweetIdRecursively(tail_tweet_id) {
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;
    const api = new Twitter(token);

    let tweet_id = tail_tweet_id;
    let fullThread = [];
    while (true) {
        try {
            const tweet = await api.getTweetWithTweetId(tweet_id);
            fullThread.push(tweet);
            const refTweets = tweet.data[0].referenced_tweets;
            if (refTweets === undefined)
                break;

            tweet_id = refTweets.find((refTweet) => refTweet?.type == "replied_to")?.id;

        } catch (e) {
            console.log(e);
            return null;
        }
    }
    return fullThread;
}

export function cleanRecursiveThread(thread) {
    let cleanThread = {
        "data": [],
        "includes": { "media": [], "users": [] },
        "replies_meta": {
            "newest_id": null,
            "oldest_id": null,
            "result_count": thread.length
        }
    };

    thread.forEach(tweet => {
        cleanThread.data.push(tweet.data[0]);
        cleanThread.includes.media.push(...tweet.includes?.media || []);
        cleanThread.includes.users.push(...tweet.includes?.users || []);
    });

    cleanThread.replies_meta.newest_id = cleanThread.data[0].id;
    cleanThread.data = cleanThread.data.reverse();
    cleanThread.includes.media = cleanThread.includes.media.reverse();
    cleanThread.replies_meta.oldest_id = cleanThread.data[0].id;

    return cleanThread;
}

export function getMediaForKeys(mediaKeys, media) {
    if (typeof mediaKeys == "undefined" || typeof media == "undefined")
        return [];
    const mediaInfo = mediaKeys.map((value) => media[value]) || [];
    return mediaInfo;
}

export function extractMediaFromThread(fullThread) {
    const mediaList = fullThread.includes?.media || [];

    // convert the list into an object of media keys
    const mediaibrary = mediaList.reduce((obj, item) => (obj[item.media_key] = item, obj), {});
    return mediaibrary;
}

export function cleanTweetObject(tweet, mediaibrary) {
    //TODO clean up the text removing tweet urls if needed
    //TODO add tests
    const tweetText = tweet.text;
    const media = getMediaForKeys(tweet.attachments?.media_keys, mediaibrary);
    const cleanedTweet = {
        "text": tweetText,
        "media": media
    }
    return cleanedTweet;
}
