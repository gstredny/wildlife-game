import test from "node:test";
import assert from "node:assert/strict";
import { pickVoice } from "../src/voice.js";

test("without a recording, the device's own voice is a man's voice when it has one", () => {
  const voices = [
    { name: "Samantha", lang: "en-US", localService: true },
    { name: "Google UK English Female", lang: "en-GB", localService: false },
    { name: "Aaron", lang: "en-US", localService: true },
    { name: "Zarvox", lang: "en-US", localService: true }
  ];
  assert.equal(pickVoice(voices).name, "Aaron");
  assert.equal(pickVoice(voices.filter(voice => voice.name !== "Aaron")).name, "Samantha");
});
