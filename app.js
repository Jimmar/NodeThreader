import { promises as fs } from 'fs';
import Twitter from './tw_api.js';

async function getTwitterCredentials() {
    let keys = await fs.readFile('keys.json');
    let tw_credentails = JSON.parse(keys)['twitter'];
    return tw_credentails;
}

async function getThreadTweetsForTweetId(tweet_id){
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;

    let api = new Twitter(token);
    try {

        const tweet = await api.getTweetWithTweetId(tweet_id);
        const conversation_id = tweet.data[0].conversation_id;
        const root_tweet = await api.getTweetWithTweetId(conversation_id);

        const username = root_tweet.includes.users[0].username;
        const replies = await api.searchTweetsForWithConversationId(conversation_id, username);
        const fullThread = [root_tweet, replies]
        
        return fullThread;

    } catch (e) {
        console.log(e);
        return null;
    }
}


(async () => {
    // const tweet_id = "1326591147834306561";
    // let fullThread = await getThreadTweetsForTweetId(tweet_id);
    // console.log(fullThread);
    // process.exit();

    let fullThread = JSON.parse(await fs.readFile("testThread.json"));
    // console.log(fullThread);

    let threadText = [fullThread[0].data[0].text];
    fullThread[1].data.forEach(tweet => {
        threadText.push(tweet.text);
    });
    console.log(threadText)

})();
