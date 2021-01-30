import { deepStrictEqual } from "assert";
import { validTwitterStatusUrl } from "../../src/helper/twitter.js";


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
