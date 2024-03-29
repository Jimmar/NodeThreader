import { promises as fs } from "fs";
import { getThreadFromDB, storeDataToDB } from "../helper/dbConnector.js";
import Twitter from "./core/tw_api.js";
import { expandtcoUrl } from "../helper/twitter.js";

async function getTwitterCredentials() {
  let tw_credentials = {
    key: process.env.TW_KEY,
    secret: process.env.TW_SECRET,
    bearer_token: process.env.TW_BEARER_TOKEN,
  };
  //currently only need bearer_token so only checks it
  if (tw_credentials.bearer_token === undefined) {
    console.warn("no TW_BEARER_TOKEN in ENV, attempting to read from keys.json");
    const keys = await fs.readFile("src/config/keys.json");
    tw_credentials = JSON.parse(keys)["twitter"];
  }
  return tw_credentials;
}

export async function getThreadFromDBForConversationId(conversation_id) {
  let cleanedThread = await getThreadFromDB(conversation_id);
  if (cleanedThread) return cleanedThread;
  console.log(`Thread for conversation id ${conversation_id} doesn't exist in cache`);
  throw "NoCachedThreadForId";
}

export async function fetchThreadTweetsForTweetId(tweet_id) {
  //TODO this is ugly, refactor
  //TODO handle the case where the id is wrong
  let cleanedThread = await getThreadFromDB(tweet_id);
  if (cleanedThread) return cleanedThread;
  console.log(`Thread for tweet ${tweet_id} doesn't exist in cache, fetching`);

  const credentials = await getTwitterCredentials();
  const token = credentials.bearer_token;
  const api = new Twitter(token);

  try {
    const tweet = await api.getTweetWithTweetId(tweet_id);
    if ("errors" in tweet) {
      console.log(tweet.errors[0].detail);
      throw Error("NoTweetForId");
    }
    const conversation_id = tweet.data[0].conversation_id;
    if (conversation_id != tweet_id) {
      cleanedThread = await getThreadFromDB(conversation_id);
      if (cleanedThread) return cleanedThread;
    }

    console.log(`Thread for conversation ${conversation_id} doesn't exist in cache, fetching`);
    const rootTweet = conversation_id == tweet.data[0].id ? tweet : await api.getTweetWithTweetId(conversation_id);

    const username = rootTweet.includes.users[0].username;
    const replies = await api.searchUserTweetsWithConversationId(conversation_id, username);

    //if there aren't many replies, most likely need to get tweets recursively
    //TODO handle this to show an indicator of trying for recursive fetch
    if (replies?.data?.length < 2 || replies?.meta?.result_count == 0)
      // cleanedThread = await getThreadTweetsForTweetIdRecursively(tweet_id);
      return null;
    else {
      const fullThread = {
        data: [...(rootTweet.data || []), ...(replies?.data?.reverse() || [])],
        includes: {
          media: [...(rootTweet.includes?.media || []), ...(replies?.includes?.media?.reverse() || [])],
          users: [...(rootTweet.includes?.users || []), ...(replies?.includes?.users || [])],
        },
        replies_meta: replies?.meta,
      };
      cleanedThread = cleanThread(fullThread);
    }
    cleanedThread = await enhanceThreadWithMediaVariants(cleanedThread, api);
    if (cleanedThread && cleanedThread.data.length > 1) {
      console.log(`Storing thread with conversation ${conversation_id}`);
      await storeDataToDB(cleanedThread);
    } else {
      console.warn("Thread has one or less tweets");
    }
    return cleanedThread;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getThreadTweetsForTweetIdRecursively(tail_tweet_id) {
  console.log("fetching thread recursively");
  const credentials = await getTwitterCredentials();
  const token = credentials.bearer_token;
  const api = new Twitter(token);

  let tweet_id = tail_tweet_id;
  let fullThread = [];
  while (true) {
    try {
      const tweet = await api.getTweetWithTweetId(tweet_id);
      if (tweet.errors) {
        //TODO handle going over the limit by adding sleep
        console.log(`Error while getting Tweet with id ${tweet_id}`);
        console.log(tweet);
      }
      fullThread.push(tweet);
      const refTweets = tweet?.data?.[0]?.referenced_tweets;
      if (refTweets === undefined) {
        break;
      }
      tweet_id = refTweets.find((refTweet) => refTweet?.type == "replied_to")?.id;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  console.log(`recursively fetched ${fullThread.length} tweets for tail_tweet_id=${tail_tweet_id}`);
  const cleanedThread = cleanRecursiveThread(fullThread);
  return cleanedThread;
}

export function cleanRecursiveThread(thread) {
  let cleanedThread = {
    data: [],
    includes: { media: [], users: [] },
    replies_meta: {
      newest_id: null,
      oldest_id: null,
      result_count: thread.length,
    },
  };

  thread.forEach((tweet) => {
    cleanedThread.data.push(tweet.data[0]);
    cleanedThread.includes.media.push(...(tweet.includes?.media || []));
    cleanedThread.includes.users.push(...(tweet.includes?.users || []));
  });

  cleanedThread.replies_meta.newest_id = cleanedThread.data[0].id;
  cleanedThread.data = cleanedThread.data.reverse();
  cleanedThread.includes.media = cleanedThread.includes.media.reverse();
  cleanedThread.replies_meta.oldest_id = cleanedThread.data[0].id;

  cleanedThread = cleanThread(cleanedThread);
  return cleanedThread;
}

export function cleanThread(thread) {
  //removes duplicate users
  thread.includes.users = thread.includes.users.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
  //fix profile image url to larger size
  thread.includes.users.forEach((user) => (user.profile_image_url = user.profile_image_url?.replace("_normal", "")));
  thread.conversation_id = thread.data[0].conversation_id;
  return thread;
}

export async function enhanceThreadWithMediaVariants(thread, api) {
  await Promise.all(
    thread.includes.media.map(async (mediaInfo) => {
      if (mediaInfo.type == "video" || mediaInfo.type == "animated_gif") {
        const tweet = thread.data.find((threadTweet) =>
          threadTweet.attachments?.media_keys?.includes(mediaInfo.media_key)
        );
        const tweetId = tweet.id;
        const legacyTweet = await api.getTweetWithTweetId_V1(tweetId);

        mediaInfo["variants"] = legacyTweet?.extended_entities?.media[0]?.video_info?.variants ?? null;
        mediaInfo["variants"]?.sort((a, b) => a.bitrate - b.bitrate).reverse();
      }
    })
  );
  return thread;
}

export function getMediaForKeys(mediaKeys, media) {
  if (typeof mediaKeys == "undefined" || typeof media == "undefined") return [];
  const mediaInfo = mediaKeys.map((value) => media[value]) || [];
  return mediaInfo;
}

export function extractMediaFromThread(fullThread) {
  const mediaList = fullThread.includes?.media || [];

  // convert the list into an object of media keys
  const mediaLibrary = mediaList.reduce((obj, item) => ((obj[item.media_key] = item), obj), {});
  return mediaLibrary;
}

export async function cleanTweetObject(tweet, mediaLibrary) {
  //TODO clean up the text removing tweet urls if needed
  //TODO add tests
  let tweetText = tweet.text;
  const media = getMediaForKeys(tweet.attachments?.media_keys, mediaLibrary);

  // cleans media variants and sort them with the highest bit rate at the top
  // TODO refactor this maybe moving into another function
  media.forEach((mediaElement) => {
    if (mediaElement.hasOwnProperty("variants")) {
      mediaElement.variants = mediaElement.variants.filter((m) => m.hasOwnProperty("bitrate"));
    }
  });
  //TODO have quoted tweets get fetched in the frontend
  let quotedTweet = tweet.referenced_tweets?.find((t) => t.type == "quoted");
  if (quotedTweet) {
    //TODO no need to get credentials for this api
    const credentials = await getTwitterCredentials();
    const token = credentials.bearer_token;
    const api = new Twitter(token);

    quotedTweet = await api.getEmbedTweet(quotedTweet.id);
    // hides parent of quoted tweet
    if ("error" in quotedTweet) {
      quotedTweet.html = "<blockquote class='quotedTweetUnavailable'> This Tweet is unavailable. </blockquote>";
    } else {
      //TODO check if this actually works or not
      quotedTweet.html = quotedTweet.html.replace("<blockquote ", '<blockquote data-conversation="none" ');
    }
  }
  //TODO this should probably be done on fetch time (or dynamically from the frontend)
  tweetText = await expandTweetUrls({ tweetText, addAHrefTag: true });
  tweetText = hyperlinkHashTags(tweetText);
  tweetText = hyperlinkAts(tweetText);
  const cleanedTweet = {
    id: tweet.id,
    text: tweetText,
    media: media,
    quotedhtml: quotedTweet?.html,
  };
  return cleanedTweet;
}

//TODO this might be made differently since twitter api provides those data and should be a simple replace
export async function expandTweetUrls({ tweetText, removeSelfUrl = true, addAHrefTag = false }) {
  const urls = tweetText.match(/\s?https:\/\/t\.co\/\S+/g);
  if (urls && urls.length > 0) {
    let urlsMap = await Promise.all(urls.map((url) => expandtcoUrl(url)));

    urls.forEach((url, i) => {
      let replaceWith = url;
      if (urlsMap[i] != null)
        replaceWith = removeSelfUrl && urlsMap[i].startsWith("https://twitter.com") ? "" : ` ${urlsMap[i]}`;
      replaceWith =
        addAHrefTag && replaceWith ? ` <a href=${replaceWith.trim()}>${replaceWith.trim()}</a>` : replaceWith;
      tweetText = tweetText.replace(url, replaceWith);
    });
  }
  return tweetText;
}

//TODO this should be done in the FE
//TODO twitter.field=entities include those info, use that
export function hyperlinkHashTags(tweetText) {
  const hashtagUrl = "https://twitter.com/hashtag";
  tweetText = tweetText.replace(/#(\S+)/g, `<a href=${hashtagUrl}/$1>#$1</a>`);
  return tweetText;
}

//TODO this should be done in the FE
//TODO twitter.field=entities include those info, use that
export function hyperlinkAts(tweetText) {
  const atUrl = "https://twitter.com";
  tweetText = tweetText.replace(/@(\S+)/g, `<a href=${atUrl}/$1>@$1</a>`);
  return tweetText;
}
