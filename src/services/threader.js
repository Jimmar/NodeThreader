import { promises as fs } from 'fs';
import Twitter from './core/tw_api.js';


async function getTwitterCredentials() {
    const keys = await fs.readFile('src/config/keys.json');
    const tw_credentials = JSON.parse(keys)['twitter'];
    return tw_credentials;
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

        const cleanedThread = cleanThread(fullThread);
        return cleanedThread;

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
            if (tweet.errors){
                //TODO handle going over the limit by adding sleep
                console.log(`Error while getting Tweet with id ${tweet_id}`);
                console.log(tweet);
            }
            fullThread.push(tweet);
            const refTweets = tweet?.data?.[0]?.referenced_tweets;
            if (refTweets === undefined){
                break;
            }

            tweet_id = refTweets.find((refTweet) => refTweet?.type == "replied_to")?.id;

        } catch (e) {
            console.log(e);
            return null;
        }
    }
    const cleanedThread = cleanRecursiveThread(fullThread);
    return cleanedThread;
}

export function cleanRecursiveThread(thread) {
    let cleanedThread = {
        "data": [],
        "includes": { "media": [], "users": [] },
        "replies_meta": {
            "newest_id": null,
            "oldest_id": null,
            "result_count": thread.length
        }
    };

    thread.forEach(tweet => {
        cleanedThread.data.push(tweet.data[0]);
        cleanedThread.includes.media.push(...tweet.includes?.media || []);
        cleanedThread.includes.users.push(...tweet.includes?.users || []);
    });

    cleanedThread.replies_meta.newest_id = cleanedThread.data[0].id;
    cleanedThread.data = cleanedThread.data.reverse();
    cleanedThread.includes.media = cleanedThread.includes.media.reverse();
    cleanedThread.replies_meta.oldest_id = cleanedThread.data[0].id;

    cleanedThread = cleanThread(cleanedThread);
    return cleanedThread;
}

export function cleanThread(thread){
    //removes duplicate users
    thread.includes.users = thread.includes.users.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    thread.conversation_id = thread.data[0].conversation_id;
    return thread;
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
    const mediaLibrary = mediaList.reduce((obj, item) => (obj[item.media_key] = item, obj), {});
    return mediaLibrary;
}

export function cleanTweetObject(tweet, mediaLibrary) {
    //TODO clean up the text removing tweet urls if needed
    //TODO add tests
    const tweetText = tweet.text;
    const media = getMediaForKeys(tweet.attachments?.media_keys, mediaLibrary);
    const cleanedTweet = {
        "text": tweetText,
        "media": media
    }
    return cleanedTweet;
}
