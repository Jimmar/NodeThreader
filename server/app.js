import express from "express";
import { promises as fs } from 'fs';
import { cleanTweetObject, extractMediaFromThread, fetchThreadTweetsForTweetId, getThreadFromDBForConversationId } from "./src/services/threader.js";
import { validTwitterStatusUrl } from "./src/helper/twitter.js";
import Twitter from "./src/services/core/tw_api.js";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.static("src/static"));
app.use(bodyParser.json());                          // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));  // to support URL-encoded bodies

function home(req, res) {
    let context = req.dataProcessed;
    res.render("pages/home", context);
}

async function threadRequest(req, res, next) {
    let urlField = req.body?.urlField;
    if (!isNaN(urlField))
        urlField = `https://twitter.com/Twitter/status/${urlField}`;

    if (!urlField || !validTwitterStatusUrl(urlField)) {
        req.dataProcessed = { "url_error": true, "urlField": urlField };
        //TODO problem with this approach is that url doesn't change back
        return next();
    }

    //TODO fetch the thread and redirect to thread/thread_id url
    urlField = urlField.trim();
    //removes trailing backslash if exists
    urlField = urlField.slice(-1) == "/" ? urlField.slice(0, -1) : urlField;

    const threadId = urlField.split("/").pop();
    res.redirect(`/thread/${threadId}`);
}

async function threadPage(req, res) {
    //TODO should be calling the api function instead of doing it all on it's own
    //TODO should not be fetching the thread from twitter, should only display existing threads
    const thread_id = req.params?.thread_id;
    const fullThread = await fetchThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`No thread for id ${thread_id}`);

    const mediaLibrary = extractMediaFromThread(fullThread);
    const threadClean = await Promise.all(fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary)));
    const created_at = fullThread.data[0].created_at.split("T")[0];
    const author = fullThread.includes.users[0];

    const context = { "thread": threadClean, "author": author, "created_at": created_at };
    res.render("pages/thread", context);
}

app.get("/", home);
app.post("/thread", threadRequest, home);
app.get("/thread/:thread_id", threadPage);

// =================== APIS ===================

//fetches thread if it doesn't exist in db
async function threadFetchAPI(req, res) {
    const thread_id = req.params?.thread_id;
    let response = {};

    try {
        const fullThread = await fetchThreadTweetsForTweetId(thread_id);

        if (fullThread === undefined)
            response = { "status": "error", "error": "NoThreadForId", "extra": { "thread_id": thread_id } };
        else {
            const mediaLibrary = extractMediaFromThread(fullThread);
            const threadClean = await Promise.all(fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary)));
            const created_at = fullThread.data[0].created_at.split("T")[0];
            const author = fullThread.includes.users[0];
            const context = { "thread": threadClean, "author": author, "created_at": created_at };
            response = { "status": "ok", "data": context };
        }
    } catch (error) {
        response = { "status": "error", "error": error, "extra": { "thread_id": thread_id } };
    }
    return res.send(JSON.stringify(response));
}

//fetches thread recursively if it doesn't exist in db
async function threadFetchRecursiveAPI(req, res) {
    throw "Implement me";
}

//only gets existing threads
async function threadAPI(req, res) {
    const thread_id = req.params?.thread_id;
    let response = {};
    try {
        const fullThread = await getThreadFromDBForConversationId(thread_id);
        const mediaLibrary = extractMediaFromThread(fullThread);
        const threadClean = await Promise.all(fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary)));
        const created_at = fullThread.data[0].created_at.split("T")[0];
        const author = fullThread.includes.users[0];

        const context = { "thread": threadClean, "author": author, "created_at": created_at };
        response = { "status": "ok", "data": context };
    } catch (error) {
        response = { "status": "error", "error": error, "extra": { "thread_id": thread_id } };
    }
    return res.send(JSON.stringify(response));
}

async function threadLatestAPI(req, res) {
    //TODO
    throw "Implement me";
}

app.get("/api/thread/fetch/:thread_id", threadFetchAPI);
app.get("/api/thread/fetchRecursive/:thread_id", threadFetchRecursiveAPI);
app.get("/api/thread/show/:thread_id", threadAPI);
app.get("/api/thread/latest/:thread_id", threadLatestAPI);
// =================== APIS ===================

app.listen(port, () => {
    console.log(`app running on port:${port}`);
});


const FIXTURES = "test/fixtures";
const tweet_id = "1365443839184547843";

// (async () => {

    // console.time('getThreadTweetsForTweetIdRecursively');
    // // let fullThread = await getThreadTweetsForTweetId(tweet_id);
    // const keys = await fs.readFile("src/config/keys.json");
    // const credentials = JSON.parse(keys)["twitter"];
    // const token = credentials.bearer_token;
    // const api = new Twitter(token);
    // const tweet = await api.getTweetV1({tweetId:tweet_id});
    // console.log(tweet);
    // console.log("=========");
    // console.log(JSON.stringify(tweet));

    // await fs.writeFile(`${FIXTURES}/test.json`, JSON.stringify(fullThread));
    // console.log(fullThread);

    // let mediaLibrary = extractMediaFromThread(fullThread);
    // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    // console.log(fullThread)
    // process.exit();
// })();
