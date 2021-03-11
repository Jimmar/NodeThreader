import needle from "needle";
const baseURL = "https://api.twitter.com/2";
const baseURLv1 = "https://api.twitter.com/1.1";

let Twitter = function (bearer_token) {
    this.bearer_token = bearer_token;
    this.bearer_headers = { "authorization": `Bearer ${bearer_token}` };
    return this;
};

// ============================== Core Functions ==============================
Twitter.prototype.baseGetRequest = async function (endpointURL, params, headers) {
    const res = await needle("get", endpointURL, params, { headers: headers });

    if (!res.body)
        throw new Error(`Unsuccessful request to ${endpointURL} with ${params}`);

    return res.body;
};

Twitter.prototype.getTweet = async function ({ tweetId, tweetFields = "", expansions = "", mediaFields = "", userFields = "" }) {
    const endpointURL = `${baseURL}/tweets?ids=`;

    const params = {
        "ids": Array.isArray(tweetId) ? tweetId.join() : tweetId.toString(),
        "tweet.fields": tweetFields,
        "expansions": expansions,
        "media.fields": mediaFields,
        "user.fields": userFields
    };

    return await this.baseGetRequest(endpointURL, params, this.bearer_headers);
};

Twitter.prototype.searchRecentTweets = async function ({ query, tweetFields = "", expansions = "", mediaFields = "", maxResults = 100 }) {
    const endpointURL = `${baseURL}/tweets/search/recent?=`;

    const params = {
        "query": query,
        "tweet.fields": tweetFields,
        "expansions": expansions,
        "media.fields": mediaFields,
        "max_results": maxResults
    };
    return await this.baseGetRequest(endpointURL, params, this.bearer_headers);
};

Twitter.prototype.getTweetV1 = async function ({ tweetId, includeEntities = true, tweetMode }) {
    const endpointURL = `${baseURLv1}/statuses/show.json`;
    const params = {
        "id": tweetId,
        "include_entities": includeEntities,
        "tweet_mode": tweetMode
    };

    const res = await needle("get", endpointURL, params, { headers: this.bearer_headers });

    if (!res.body)
        throw new Error(`Unsuccessful request to ${endpointURL} with ${params}`);

    return res.body;
};

// ============================ Core Functions END ============================

Twitter.prototype.getTweetWithTweetId = async function (tweetId) {
    const params = {
        "tweetId": tweetId,
        "tweetFields": `created_at,attachments,lang,referenced_tweets,conversation_id`,
        "expansions": "attachments.media_keys,author_id",
        "mediaFields": "type,preview_image_url,duration_ms,height,width,url",
        "userFields": "profile_image_url"
    };

    let tweet = await this.getTweet(params);
    return tweet;
};

Twitter.prototype.searchUserTweetsWithConversationId = async function (conversation_id, username) {
    const params = {
        "query": `from:${username} to:${username} conversation_id:${conversation_id}`,
        "tweetFields": `created_at,attachments,lang,referenced_tweets,conversation_id`,
        "expansions": "attachments.media_keys,author_id",
        "mediaFields": "type,preview_image_url,duration_ms,height,width,url",
        "maxResults": 100
    };

    let tweets = this.searchRecentTweets(params);
    return tweets;
};

Twitter.prototype.getTweetWithTweetId_V1 = async function (tweetId) {
    const params = {
        "tweetId": tweetId,
        "includeEntities": true,
        "tweetMode": "extended"
    };

    let tweet = await this.getTweetV1(params);
    return tweet;
};


export default Twitter;
