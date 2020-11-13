import needle from 'needle';
import { promises as fs } from 'fs';

const CONVERSATION_ID = 'conversation_id';

async function getTwitterCredentials() {
    let keys = await fs.readFile('keys.json');
    let tw_credentails = JSON.parse(keys)['twitter'];
    return tw_credentails;
}

const credentials = await getTwitterCredentials();
const token = credentials.bearer_token;
const baseURL = "https://api.twitter.com/2"

const headers = { "authorization": `Bearer ${token}` };

async function getTweetWithConversationID(tweetId) {
    const endpointURL = `${baseURL}/tweets?ids=`
    

    const params = {
        "ids": `${tweetId}`,
        "tweet.fields": `${CONVERSATION_ID}`,
        "expansions": 'author_id'
    }
    const res = await needle('get', endpointURL, params, { headers: headers })

    if (!res.body)
        throw new Error('Unsuccessful request');

    return res.body;
}

async function searchTweetsForWithConversationId(conversation_id, username) {
    const endpointURL = `${baseURL}/tweets/search/recent?=`
    console.log(conversation_id)

    const params = {
        "query": `from:${username} to:${username} conversation_id:${conversation_id}`,
        "tweet.fields": `created_at,attachments,lang,referenced_tweets`,
        "expansions": "attachments.media_keys",
        "media.fields": "type,preview_image_url,duration_ms,height,width,url",
        "max_results": 100
    }
    const res = await needle('get', endpointURL, params, { headers: headers })

    if (!res.body)
        throw new Error('Unsuccessful request');

    return res.body;
}

const tweet_id = "1326591147834306561";
(async () => {

    try {
        // Make request
        const tweet = await getTweetWithConversationID(tweet_id);
        // console.log(tweet)

        const replies = await searchTweetsForWithConversationId(tweet.data[0].conversation_id, tweet.includes.users[0].username)
        console.log(replies)

        replies.data.forEach(tw => {
            console.log("================================")
            console.log(tw)
        });
        console.log("================================")
        replies.includes.media.forEach(tw => {
            console.log("================================")
            console.log(tw)
        });
        

    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();
