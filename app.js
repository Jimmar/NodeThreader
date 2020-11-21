import { promises as fs } from 'fs';
import Twitter from './tw_api.js';

const FIXTURES = "tests/fixtures/";

async function getTwitterCredentials() {
    let keys = await fs.readFile('keys.json');
    let tw_credentails = JSON.parse(keys)['twitter'];
    return tw_credentails;
}

async function getThreadTweetsForTweetId(tweet_id) {
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;

    let api = new Twitter(token);
    try {

        const tweet = await api.getTweetWithTweetId(tweet_id);
        const conversation_id = tweet.data[0].conversation_id;
        const rootTweet = conversation_id == tweet.data[0].id ? tweet : await api.getTweetWithTweetId(conversation_id);

        const username = rootTweet.includes.users[0].username;
        const replies = await api.searchTweetsForWithConversationId(conversation_id, username);

        let fullThread = {
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

function getMediaForKeys(mediaKeys, media) {
    if (typeof mediaKeys == "undefined" || typeof media == "undefined")
        return [];
    let mediaInfo = mediaKeys.map((value) => media[value]) || [];
    return mediaInfo;
}

function extractMediaFromThread(fullThread) {
    let mediaList = fullThread.includes?.media || [];

    // convert the list into an object of media keys
    const mediaibrary = mediaList.reduce((obj, item) => (obj[item.media_key] = item, obj), {});
    return mediaibrary;
}

function cleanTweetObject(tweet, mediaibrary) {
    //TODO clean up the text removing tweet urls if needed
    const tweetText = tweet.text;
    const media = getMediaForKeys(tweet.attachments?.media_keys, mediaibrary);
    const cleanedTweet = {
        "text": tweetText,
        "media": media
    }
    return cleanedTweet;
}
// function extractThreadWithID

const tweet_id = "1329854762926432257";

(async () => {
    // let fullThread = await getThreadTweetsForTweetId(tweet_id);
    // fs.writeFile("tests/fixtures/threadVideo.json", JSON.stringify(fullThread));

    // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadMultiPictures.json`));
    // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadTextOnly.json`));
    let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadVideo.json`));

    let mediaibrary = extractMediaFromThread(fullThread);
    let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaibrary));

    console.log(threadClean)
    // process.exit();
})();
