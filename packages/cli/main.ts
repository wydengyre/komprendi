import Anthropic from "@anthropic-ai/sdk";
import type {
	MessageParam,
	MessageStreamParams,
} from "@anthropic-ai/sdk/resources/messages.js";
import { epubHtmls } from "@komprendi/epub/epub.js";
import { getTestEpubBytes } from "@komprendi/test/tools.js";
import { compile as compileHtmlConvert } from "html-to-text";

const anthropic = new Anthropic();

const epub = await getTestEpubBytes();
// TODO: sections aren't enough. We want structure

const htmls = epubHtmls(epub);

const htmlToText = compileHtmlConvert({
	selectors: [
		// don't include links in text
		{ selector: "a", options: { ignoreHref: true } },
		// don't include images in text
		{ selector: "img", format: "skip" },
	],
	wordwrap: false,
});

const sectionsXml = await (async () => {
	let out = "";
	for await (const html of htmls) {
		const text = htmlToText(html);
		const sectionXml = `<section>${text}</section>`;
		out += sectionXml;
	}
	return out;
})();

// prompt tips:
// https://docs.anthropic.com/claude/docs/long-context-window-tips
const content = `I'm going to give you a book. Read the book carefully. Here is the book:
<document>${sectionsXml}</document>

Summarize each chapter of the book in a paragraph.`;

const message: MessageParam = { role: "user", content };
const messageParams: MessageStreamParams = {
	messages: [message],
	model: "claude-3-haiku-20240307",
	max_tokens: 4096, // max from https://docs.anthropic.com/claude/docs/models-overview
};

const stream = anthropic.messages.stream(messageParams);
let outputTokenCount = 0;
for await (const event of stream) {
	if (event.type === "content_block_delta") {
		process.stdout.write(event.delta.text);
	} else if (event.type === "message_start") {
		console.log("input token count:", event.message.usage.input_tokens);
	}
	if (event.type === "message_delta") {
		outputTokenCount = event.usage.output_tokens;
	}
}

console.log("\nOutput token count:", outputTokenCount);
