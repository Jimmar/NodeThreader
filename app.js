import express from "express";
import { promises as fs } from 'fs';
import { cleanTweetObject, extractMediaFromThread, getThreadTweetsForTweetId } from "./src/services/threader.js";
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
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`No thread for id ${thread_id}`);

    const mediaLibrary = extractMediaFromThread(fullThread);
    const threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));
    const created_at = fullThread.data[0].created_at.split("T")[0];
    const author = fullThread.includes.users[0];

    const context = { "thread": threadClean, "author": author, "created_at": created_at };
    res.render("pages/thread", context);
}

app.get("/", home);
app.post("/thread", threadRequest, home);
app.get("/thread/:thread_id", threadPage);

// =================== APIS ===================
async function threadAPI(req, res) {
    const thread_id = req.params?.thread_id;
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`{error: No thread for id ${thread_id}}`);

    let mediaLibrary = extractMediaFromThread(fullThread);
    let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    return res.send(JSON.stringify(threadClean));
}

app.get("/api/thread/:thread_id", threadAPI);
// =================== APIS ===================

app.listen(port, () => {
    console.log(`app running on port:${port}`);
});


// const FIXTURES = "test/fixtures";
// const tweet_id = "1341193051184611331";

// (async () => {

//     console.time('getThreadTweetsForTweetIdRecursively');
//     // let fullThread = await getThreadTweetsForTweetId(tweet_id);
//     const keys = await fs.readFile("src/config/keys.json");
//     const credentials = JSON.parse(keys)["twitter"];
//     const token = credentials.bearer_token;
//     const api = new Twitter(token);
//     const tweet = await api.getTweetWithTweetId(tweet_id);
//     console.timeEnd('getThreadTweetsForTweetIdRecursively');
//     // console.log(JSON.stringify(tweet));

//     // await fs.writeFile(`${FIXTURES}/test.json`, JSON.stringify(fullThread));
//     // console.log(fullThread);

//     // let mediaLibrary = extractMediaFromThread(fullThread);
//     // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

//     // console.log(fullThread)
//     process.exit();
// })();
