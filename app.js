import { promises as fs } from "fs";
import { cleanRecursiveThread } from "./threader.js";

const FIXTURES = "test/fixtures";

const tweet_id = "1333834585118007300";

(async () => {
    // let fullThread = await getThreadTweetsForTweetIdRecursively(tweet_id);

    let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadRecursive.json`));
    let cleanThread = cleanRecursiveThread(fullThread);
    console.log(cleanThread);
    // let fullThread = await getThreadTweetsForTweetId(tweet_id);
    // fs.writeFile("tests/fixtures/threadRecursiveCleaned.json", JSON.stringify(cleanThread));

    // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadMultiPictures.json`));
    // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadTextOnly.json`));


    // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadMixedMedia.json`));

    // let mediaibrary = extractMediaFromThread(fullThread);
    // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaibrary));

    // console.log(threadClean)
    // process.exit();
})();
