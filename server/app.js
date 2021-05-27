import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { validTwitterStatusUrl } from "./src/helper/twitter.js";
import { cleanTweetObject, extractMediaFromThread, fetchThreadTweetsForTweetId, getThreadFromDBForConversationId } from "./src/services/threader.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(cors())
app.use(express.static("src/static"));
app.use(bodyParser.json());                          // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));  // to support URL-encoded bodies
//TODO define allowed origins


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

    //TODO fetch the thread and redirect to thread/threadId url
    urlField = urlField.trim();
    //removes trailing backslash if exists
    urlField = urlField.slice(-1) == "/" ? urlField.slice(0, -1) : urlField;

    const threadId = urlField.split("/").pop();
    res.redirect(`/thread/${threadId}`);
}

async function threadPage(req, res) {
    //TODO should be calling the api function instead of doing it all on it's own
    //TODO should not be fetching the thread from twitter, should only display existing threads
    const threadId = req.params?.threadId;
    const fullThread = await fetchThreadTweetsForTweetId(threadId);
    if (fullThread === undefined)
        return res.send(`No thread for id ${threadId}`);

    const data = await getDataForThread(fullThread);
    res.render("pages/thread", data);
}

app.get("/", home);
app.post("/thread", threadRequest, home);
app.get("/thread/:threadId", threadPage);

// =================== APIS ===================

//fetches thread if it doesn't exist in db
async function threadFetchAPI(req, res) {
    let response = null;
    const urlFieldRaw = req.body?.urlField;
    let urlField = urlFieldRaw;

    urlField = !isNaN(urlField) ? `https://twitter.com/Twitter/status/${urlField}` : urlField;
    //trims and removes path arguments
    urlField = urlField.trim().split("?")[0];
    //removes trailing backslash if exists
    urlField = urlField.slice(-1) == "/" ? urlField.slice(0, -1) : urlField;

    if (!urlField || !validTwitterStatusUrl(urlField))
        response = { "status": "error", "error": "InvalidUrl", "extra": { "urlField": urlFieldRaw } };

    if (!response) {
        try {
            const threadId = urlField.split("/").pop();
            const fullThread = await fetchThreadTweetsForTweetId(threadId);

            if (fullThread == null)
                response = { "status": "error", "error": "NoThreadForId", "extra": { "urlField": urlFieldRaw } };
            else {
                const conversation_id = fullThread.data[0].conversation_id;
                response = { "status": "ok", conversation_id };
            }
        } catch (error) {
            console.error(error);
            response = { "status": "error", "error": "InternalError", "error_debug": error.message, "extra": { "urlField": urlFieldRaw } };
        }
    }
    return res.send(JSON.stringify(response));
}

//fetches thread recursively if it doesn't exist in db
async function threadFetchRecursiveAPI(req, res) {
    throw "Implement me";
}

//only gets existing threads
async function threadAPI(req, res) {
    const threadId = req.params?.threadId;
    let response = {};
    try {
        const fullThread = await getThreadFromDBForConversationId(threadId);
        const data = await getDataForThread(fullThread);
        response = { "status": "ok", "data": data };
    } catch (error) {
        console.error(error)
        response = { "status": "error", "error": error, "extra": { "threadId": threadId } };
    }
    return res.send(JSON.stringify(response));
}

async function threadLatestAPI(req, res) {
    //TODO
    throw "Implement me";
}

app.post("/api/thread/fetch", threadFetchAPI);
app.get("/api/thread/fetchRecursive/:threadId", threadFetchRecursiveAPI);
app.get("/api/thread/show/:threadId", threadAPI);
app.get("/api/thread/latest/:threadId", threadLatestAPI);
// =================== /APIS ===================

//creates a data from thread to be sent to FE
async function getDataForThread(fullThread) {
    const mediaLibrary = extractMediaFromThread(fullThread);
    const threadClean = await Promise.all(fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary)));
    const created_at = fullThread.data[0].created_at.split("T")[0];
    const author = fullThread.includes.users[0];
    const data = { "thread": threadClean, "author": author, "created_at": created_at, "conversation_id": fullThread.data[0].conversation_id };
    return data;
}

app.listen(port, () => {
    console.log(`app running on port:${port}`);
});
