import { deepStrictEqual } from "assert";
import fs from "fs";
import { cleanRecursiveThread, extractMediaFromThread } from "../../src/services/threader.js";

const FIXTURES = "test/fixtures";

describe("cleanRecursiveThread", () => {
  const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadRecursive.json`));
  const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadRecursiveCleaned.json`));

  it("clean the thread", () => {
    deepStrictEqual(cleanRecursiveThread(dataInput), expectedOutput);
  })
})

describe("extract media from thread", () => {
  const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadMultiPictures.json`));
  const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/mediaThreadMultiPictures.json`));
  
  it("should extract media", () => {
    deepStrictEqual(extractMediaFromThread(dataInput), expectedOutput);
  })
})
