import { Logger } from "../../modules/logger";
import { getByProps, getBySource, getByValue, getModule } from "src/renderer/modules/webpack";
import { Filter } from "src/types";
import { sourceStrings } from "src/renderer/modules/webpack/patch-load";

const PORT = 8485;

const devLogger = Logger.api("DevCompanion");

export let socket: WebSocket | undefined;

type Node = StringNode | RegexNode | FunctionNode;

interface StringNode {
  type: "string";
  value: string;
}

interface RegexNode {
  type: "regex";
  value: {
    pattern: string;
    flags: string;
  };
}

interface FunctionNode {
  type: "function";
  value: string;
}

interface PatchData {
  find: string | RegExp;
  replacement: Array<{
    match: StringNode | RegexNode;
    replace: StringNode | FunctionNode;
  }>;
}

interface FindData {
  type: string;
  args: Array<StringNode | FunctionNode>;
}

function parseNode(node: Node): string | RegExp {
  switch (node.type) {
    case "string":
      return node.value;
    case "regex":
      return new RegExp(node.value.pattern, node.value.flags);
    case "function":
      // We LOVE remote code execution
      // Safety: This comes from localhost only, which actually means we have less permissions than the source,
      // since we're running in the browser sandbox, whereas the sender has host access
      // eslint-disable-next-line no-eval
      return (0, eval)(node.value);
    default:
      throw new Error(`Unknown Node Type ${(node as Node).type}`);
  }
}

function parseFind(type: string, args: unknown[]): unknown {
  devLogger.log(`Received find parsing request of type ${type} with args: ${args}`);
  switch (type.replace("get", "")) {
    case "Module":
      return getModule(args[0] as Filter, { all: true });
    case "ByProps":
      return getByProps(args as string[], { all: true });
    case "BySource":
      return getBySource(args[0] as string | RegExp, { all: true });
    case "ByValue":
      return getByValue(args[0] as string | RegExp, { all: true });
    default:
      throw new Error(`Unknown Find Type ${type}`);
  }
}

function search(find: string | RegExp): string[] {
  return Object.values(sourceStrings).filter((s) => {
    if (typeof find === "string") {
      return s.includes(find);
    }
    if (find instanceof RegExp) {
      const matches = find.test(s);
      find.lastIndex = 0;
      return matches;
    }
    return false;
  });
}

export function initWs(isManual = false): void {
  let wasConnected = isManual;
  let hasErrored = false;
  const ws = new WebSocket(`ws://localhost:${PORT}`);
  socket = ws;

  ws.addEventListener("open", () => {
    wasConnected = true;
    devLogger.log("Connected to WebSocket");
  });

  ws.addEventListener("error", (e) => {
    if (!wasConnected) return;

    hasErrored = true;

    devLogger.error("Dev Companion Error:", e);
  });

  ws.addEventListener("close", (e) => {
    if (!wasConnected && !hasErrored) return;

    devLogger.log("Dev Companion Disconnected", e.code, e.reason);
  });

  ws.addEventListener("message", (e) => {
    let nonce: unknown, type: string, data: PatchData | FindData;
    try {
      // {nonce, type, data}=JSON.parse(e.data)
      let rec = JSON.parse(e.data);
      nonce = rec.nonce;
      type = rec.type;
      data = rec.data;
    } catch (err) {
      devLogger.error("Invalid JSON:", err, `\n${e.data}`);
      return;
    }

    function reply(error?: string): void {
      const data = { nonce, ok: !error } as Record<string, unknown>;
      if (error) data.error = error;

      ws.send(JSON.stringify(data));
    }

    devLogger.log("Received Message:", type, "\n", data);

    switch (type) {
      case "testPatch": {
        const { find, replacement: replacements } = data as PatchData;

        const candidates = search(find);
        const keys = Object.keys(candidates);
        if (keys.length !== 1) {
          reply(`Expected exactly one 'find' match, found ${keys.length}`);
          return;
        }

        let src = String(candidates[keys[0] as keyof typeof candidates]);

        let i = 0;
        for (const { match, replace } of replacements) {
          i++;

          try {
            const matcher = parseNode(match);
            const replacement = parseNode(replace);

            const newSource = src.replace(matcher, replacement as string);

            if (src === newSource) throw new Error("Had no effect");
            // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
            Function(newSource);

            src = newSource;
          } catch (err) {
            reply(`Replacement ${i} failed: ${err}`);
            return;
          }
        }

        reply();
        break;
      }
      case "testFind": {
        const { type, args } = data as FindData;
        let parsedArgs: unknown[] | undefined;
        try {
          parsedArgs = args.map(parseNode);
        } catch (err) {
          reply(`Failed to parse args: ${err}`);
          return;
        }

        try {
          let results = parseFind(type, parsedArgs) as unknown[];
          if (results.length === 0) throw new Error("No results");
          if (results.length > 1)
            throw new Error("Found more than one result! Make this filter more specific.");
        } catch (err) {
          reply(`Failed to find: ${err}`);
          return;
        }

        reply();
        break;
      }
      default:
        reply(`Unknown Type ${type}`);
        break;
    }
  });
}

export function start(): void {
  initWs();
}
export function stop(): void {
  socket?.close(1000, "Plugin Stopped");
  socket = void 0;
}
