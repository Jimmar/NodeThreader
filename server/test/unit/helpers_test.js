import { deepStrictEqual } from "assert";
import { validTwitterStatusUrl, expandtcoUrl } from "../../src/helper/twitter.js";


describe("validate twitter status url", () => {
  it("valid twitter status url https", () => {
    let url = "https://twitter.com/Nathanial317/status/1355542394452766720";
    deepStrictEqual(validTwitterStatusUrl(url), true);
  });

  it("valid twitter status url trailing backslash", () => {
    let url = "https://twitter.com/Nathanial317/status/1355542394452766720/";
    deepStrictEqual(validTwitterStatusUrl(url), true);
  });

  it("valid twitter status url http", () => {
    let url = "http://twitter.com/Nathanial317/status/1355542394452766720";
    deepStrictEqual(validTwitterStatusUrl(url), true);
  });

  it("valid twitter status url no http", () => {
    let url = "twitter.com/Nathanial317/status/1355542394452766720";
    deepStrictEqual(validTwitterStatusUrl(url), true);
  });

  it("invalid url", () => {
    let url = "something something";
    deepStrictEqual(validTwitterStatusUrl(url), false);
  });

  it("invalid twitter status url", () => {
    let url = "https://twitter.com/jimmarxd";
    deepStrictEqual(validTwitterStatusUrl(url), false);
  });
});


describe("expand a t.co url", () => {
  it("t.co url to tweet with photo", async () => {
    let url = "https://t.co/Wz07hgO0pE"
    let expectedUrl = "https://twitter.com/Patty__Grace/status/1373993559108558851/photo/1"
    deepStrictEqual(await expandtcoUrl(url), expectedUrl);
  }).timeout(5000);

  it("t.co url to tweet with video", async () => {
    let url = "https://t.co/FRwu4MGOQw"
    let expectedUrl = "https://twitter.com/1_immi/status/1368480489233846278/video/1"
    deepStrictEqual(await expandtcoUrl(url), expectedUrl);
  }).timeout(5000);

  it("t.co url to YouTube", async () => {
    let url = "https://t.co/0pIc5l7lxw?amp=1"
    let expectedUrl = "https://youtu.be/1mLQ79-qJN8"
    deepStrictEqual(await expandtcoUrl(url), expectedUrl);
  }).timeout(5000);

  it("t.co url to memoryOfKuwait", async () => {
    let url = "https://t.co/u6Dyx4UmSy"
    //BUG this is wrong, it should get expanded to http://memoryofkuwait.nlk.gov.kw/page/lry-ysy
    let expectedUrl = null
    deepStrictEqual(await expandtcoUrl(url), expectedUrl);
  }).timeout(5000);
  
});
