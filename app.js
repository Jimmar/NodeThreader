import express from "express";
import { promises as fs } from 'fs';
import { cleanTweetObject, extractMediaFromThread, getThreadTweetsForTweetId } from "./src/services/threader.js";

const app = express();
const port = 3000

app.get("/", (req, res) => {
    return res.send("Base page")
})

app.get("/api/thread/:thread_id", async (req, res) => {
    const thread_id = req.params?.thread_id;
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`No thread for id ${thread_id}`);

    let mediaLibrary = extractMediaFromThread(fullThread);
    let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    return res.send(JSON.stringify(threadClean));
})

app.listen(port, () => {
    console.log(`app running on port:${port}`)
})


const FIXTURES = "test/fixtures";
const tweet_id = "1341193051184611331";

(async () => {

    console.time('getThreadTweetsForTweetIdRecursively')
    let fullThread = await getThreadTweetsForTweetId(tweet_id);
    console.timeEnd('getThreadTweetsForTweetIdRecursively')

    await fs.writeFile(`${FIXTURES}/test.json`, JSON.stringify(fullThread));

    // let mediaLibrary = extractMediaFromThread(fullThread);
    // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    // console.log(fullThread)
    // process.exit();
})();
