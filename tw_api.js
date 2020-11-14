import needle from "needle";
const baseURL = "https://api.twitter.com/2";

let Twitter = function (bearer_token) {
    this.bearer_token = bearer_token;
    this.bearer_headers = { "authorization": `Bearer ${bearer_token}` };
    return this;
}

// ============================== Core Functions ==============================
Twitter.prototype.baseGetRequest = async function (endpointURL, params, headers) {
    const res = await needle("get", endpointURL, params, { headers: headers })

    if (!res.body)
        throw new Error(`Unsuccessful request to ${endpointURL} with ${params}`);

    return res.body;
}

Twitter.prototype.getTweet = async function ({ tweetId, tweetFields = "", expansions = "" }) {
    const endpointURL = `${baseURL}/tweets?ids=`

    const params = {
        "ids": Array.isArray(tweetId) ? tweetId.join() : tweetId.toString(),
        "tweet.fields": tweetFields,
        "expansions": expansions
    }

    return await this.baseGetRequest(endpointURL, params, this.bearer_headers);
}

Twitter.prototype.searchRecentTweets = async function ({ query, tweetFields = "", expansions = "", mediaFields = "", maxResults = 100 }) {
    const endpointURL = `${baseURL}/tweets/search/recent?=`

    const params = {
        "query": query,
        "tweet.fields": tweetFields,
        "expansions": expansions,
        "media.fields": mediaFields,
        "max_results": maxResults
    }
    return await this.baseGetRequest(endpointURL, params, this.bearer_headers);
}

// ============================ Core Functions END ============================

Twitter.prototype.getTweetWithConversationID = async function (tweetId) {
    const params = {
        tweetId: tweetId,
        tweetFields: "conversation_id",
        expansions: "author_id"
    }

    let tweet = await this.getTweet(params);
    return tweet;
}

Twitter.prototype.searchTweetsForWithConversationId = async function (conversation_id, username) {
    const params = {
        "query": `from:${username} to:${username} conversation_id:${conversation_id}`,
        "tweetFields": `created_at,attachments,lang,referenced_tweets`,
        "expansions": "attachments.media_keys",
        "mediaFields": "type,preview_image_url,duration_ms,height,width,url",
        "maxResults": 100
    }

    let tweets = this.searchRecentTweets(params);
    return tweets;
}

export default Twitter;
