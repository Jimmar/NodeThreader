import { promises as fs } from 'fs';
import Twitter from './tw_api.js';

async function getTwitterCredentials() {
    let keys = await fs.readFile('keys.json');
    let tw_credentails = JSON.parse(keys)['twitter'];
    return tw_credentails;
}

const tweet_id = "1326591147834306561";
(async () => {
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;

    let api = new Twitter(token);
    try {
        // Make request
        const tweet = await api.getTweetWithConversationID(tweet_id);
        const conversation_id = tweet.data[0].conversation_id;
        const username = tweet.includes.users[0].username;

        const replies = await api.searchTweetsForWithConversationId(conversation_id, username);

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
