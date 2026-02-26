import { mkdirSync, writeFileSync } from "original-fs";
import { join } from "path";

interface AsarFileNode {
  offset: string;
  size: string;
}

interface AsarDirectoryNode {
  files: Record<string, AsarNode>;
}

type AsarNode = AsarFileNode | AsarDirectoryNode;

export function extractAll(buf: Buffer, dest: string): void {
  // Format: [payload_size:4][header_size:4][header_string_size:4][actual_string_size:4][header_string:N][data...]
  const headerStringSize = buf.readUInt32LE(8);
  const actualStringSize = buf.readUInt32LE(12);
  const headerString = buf.toString("utf8", 16, 16 + actualStringSize);
  const header: AsarDirectoryNode = JSON.parse(headerString);

  const baseOffset = 12 + headerStringSize;

  function extractNode(node: AsarNode, path: string): void {
    if ("files" in node) {
      // Directory
      mkdirSync(path, { recursive: true });
      for (const [name, child] of Object.entries(node.files)) {
        extractNode(child, join(path, name));
      }
    } else {
      // File
      const offset = parseInt(node.offset, 10);
      const size = parseInt(node.size, 10);
      const fileData = buf.subarray(baseOffset + offset, baseOffset + offset + size);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, fileData);
    }
  }

  extractNode(header, dest);
}
