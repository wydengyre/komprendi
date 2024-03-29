import test from "node:test";
import { getTestEpubBytes } from "@komprendi/test/tools.js";
import { epubHtmls } from "./epub.js";

test(async function epubTest() {
	const epubBytes = await getTestEpubBytes();
	const htmls = epubHtmls(epubBytes);
	let count = 0;
	for await (const html of htmls) {
		count++;
		console.log(html);
	}
	console.log("count:", count);
});
