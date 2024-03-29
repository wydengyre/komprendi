import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export { getTestEpubBytes };

function getTestEpubBytes(): Promise<ArrayBuffer> {
	const epubName = "./lives-of-the-english-poets.epub";
	const epubPath = fileURLToPath(import.meta.resolve(epubName));
	return readFile(epubPath);
}
