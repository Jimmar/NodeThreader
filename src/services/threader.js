import { promises as fs } from "fs";
import { getThreadFromDB, storeDataToDB } from "../helper/dbConnector.js";
import Twitter from "./core/tw_api.js";
import { expandtcoUrl } from "../helper/twitter.js";
import { url } from "inspector";


async function getTwitterCredentials() {
    const keys = await fs.readFile("src/config/keys.json");
    const tw_credentials = JSON.parse(keys)["twitter"];
    return tw_credentials;
}

export async function getThreadTweetsForTweetId(tweet_id) {
    //TODO this is ugly, refactor
    let cleanedThread = await getThreadFromDB(tweet_id);
    if (cleanedThread)
        return cleanedThread;
    console.log(`Thread for tweet ${tweet_id} doesn't exist in cache, fetching`);

    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;
    const api = new Twitter(token);

    try {
        const tweet = await api.getTweetWithTweetId(tweet_id);
        const conversation_id = tweet.data[0].conversation_id;
        if (conversation_id != tweet_id) {
            cleanedThread = await getThreadFromDB(conversation_id);
            if (cleanedThread)
                return cleanedThread;
        }

        console.log(`Thread for conversation ${conversation_id} doesn't exist in cache, fetching`);
        const rootTweet = conversation_id == tweet.data[0].id ? tweet : await api.getTweetWithTweetId(conversation_id);

        const username = rootTweet.includes.users[0].username;
        const replies = await api.searchUserTweetsWithConversationId(conversation_id, username);

        //if there aren't many replies, most likely need to get tweets recursively
        if (replies?.data?.length < 2 || replies?.meta?.result_count == 0)
            cleanedThread = await getThreadTweetsForTweetIdRecursively(tweet_id);
        else {
            const fullThread = {
                "data": [...rootTweet.data || [], ...replies?.data?.reverse() || []],
                "includes": {
                    "media": [...rootTweet.includes?.media || [], ...replies?.includes?.media?.reverse() || []],
                    "users": [...rootTweet.includes?.users || [], ...replies?.includes?.users || []]
                },
                "replies_meta": replies?.meta
            };
            cleanedThread = cleanThread(fullThread);
            cleanedThread = await enhanceThreadWithMediaVariants(cleanedThread, api);
            if (cleanedThread && cleanedThread.data.length > 1) {
                console.log(`Storing thread with conversation ${conversation_id}`);
                await storeDataToDB(cleanedThread);
            }
            else {
                console.warn("Thread has one or less tweets");
            }
            return cleanedThread;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function getThreadTweetsForTweetIdRecursively(tail_tweet_id) {
    console.log("fetching thread recursively");
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;
    const api = new Twitter(token);

    let tweet_id = tail_tweet_id;
    let fullThread = [];
    while (true) {
        try {
            const tweet = await api.getTweetWithTweetId(tweet_id);
            if (tweet.errors) {
                //TODO handle going over the limit by adding sleep
                console.log(`Error while getting Tweet with id ${tweet_id}`);
                console.log(tweet);
            }
            fullThread.push(tweet);
            const refTweets = tweet?.data?.[0]?.referenced_tweets;
            if (refTweets === undefined) {
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

export function cleanThread(thread) {
    //removes duplicate users
    thread.includes.users = thread.includes.users.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    //fix profile image url to larger size
    thread.includes.users.forEach(user => user.profile_image_url = user.profile_image_url?.replace("_normal", ""));
    thread.conversation_id = thread.data[0].conversation_id;
    return thread;
}

export async function enhanceThreadWithMediaVariants(thread, api) {

    await Promise.all(thread.includes.media.map(async mediaInfo => {
        if (mediaInfo.type == "video" || mediaInfo.type == "animated_gif") {
            const tweet = thread.data.find(threadTweet => threadTweet.attachments?.media_keys?.includes(mediaInfo.media_key));
            const tweetId = tweet.id;
            const legacyTweet = await api.getTweetWithTweetId_V1(tweetId);

            mediaInfo["variants"] = legacyTweet?.extended_entities?.media[0]?.video_info?.variants ?? null;
            mediaInfo["variants"]?.sort((a, b) => a.bitrate - b.bitrate).reverse();
        }
    }));
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

export async function cleanTweetObject(tweet, mediaLibrary) {
    //TODO clean up the text removing tweet urls if needed
    //TODO add tests
    let tweetText = tweet.text;
    const media = getMediaForKeys(tweet.attachments?.media_keys, mediaLibrary);

    // cleans media variants and sort them with the highest bit rate at the top
    // TODO refactor this maybe moving into another function
    media.forEach(mediaElement => {
        if (mediaElement.hasOwnProperty("variants")) {
            mediaElement.variants = mediaElement.variants.filter(m => m.hasOwnProperty("bitrate"));
        }
    });
    //TODO this should probably be done on fetch time 
    tweetText = await expandTweetUrls({tweetText});
    const cleanedTweet = {
        "text": tweetText,
        "media": media
    };
    return cleanedTweet;
}

export async function expandTweetUrls({ tweetText, removeSelfUrl = true }) {
    const urls = tweetText.match(/\s?https:\/\/t\.co\/\S+/g)
    if (urls && urls.length > 0) {
        let urlsMap = await Promise.all(urls.map(url => expandtcoUrl(url)));
        
        urls.forEach((url, i) => {
            const replaceWith = (removeSelfUrl && urlsMap[i].startsWith("https://twitter.com")) ? "" : ` ${urlsMap[i]}`;
            tweetText = tweetText.replace(url, replaceWith);
        });
    }
    return tweetText;
}
