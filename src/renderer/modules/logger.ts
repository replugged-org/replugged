/* eslint-disable no-console */

const blurple = "#5865F2";

export type LoggerType =
  | "Plugin"
  | "Coremod"
  | "API"
  | "Ignition"
  | "CommonModules"
  | "Components"
  | "Manager";

const recelledPrefix = (type: LoggerType, name: string): string => `%c[ReCelled:${type}:${name}]`;

const logColor = (color: string): string => `color: ${typeof color === "string" ? color : blurple}`;

/**
 * Log a message to the console with a ReCelled prefix.
 * @param type Type of the context of the message (e.g. API, Plugin, Coremod...)
 * @param name Name of the context of the message (e.g. Notices, SilentTyping, Badges...)
 * @param color Color of the prefix as hex or a CSS color
 * @param data Message(s) to log to the console
 */
export function log(
  type: LoggerType,
  name: string,
  color: string = blurple,
  ...data: Parameters<typeof console.log>
): void {
  console.log(recelledPrefix(type, name), logColor(color), ...data);
}

/**
 * Log a warning to the console with a ReCelled prefix.
 * @param type Type of the context of the warning (e.g. API, Plugin, Coremod...)
 * @param name Name of the context of the warning (e.g. Notices, SilentTyping, Badges...)
 * @param color Color of the prefix as hex or a CSS color
 * @param data Thing(s) to print with the warning, same as the arguments would be for `console.warn`
 */
export function warn(
  type: LoggerType,
  name: string,
  color: string = blurple,
  ...data: Parameters<typeof console.warn>
): void {
  console.warn(recelledPrefix(type, name), logColor(color), ...data);
}

/**
 * Log an error to the console with a ReCelled prefix.
 * @param type Type of the context of the error (e.g. API, Plugin, Coremod...)
 * @param name Name of the context of the error (e.g. Notices, SilentTyping, Badges...)
 * @param color Color of the prefix as hex or a CSS color
 * @param data Thing(s) to print with the error, same as the arguments would be for `console.error`
 */
export function error(
  type: LoggerType,
  name: string,
  color: string = blurple,
  ...data: Parameters<typeof console.error>
): void {
  console.error(recelledPrefix(type, name), logColor(color), ...data);
}

/**
 * A convenient way to manage logging things to the console with colorful prefixes indicating their context.
 * Each `Logger` instance stores its context type, context name, and prefix color,
 * so you can use its {@link Logger.log log}, {@link Logger.warn warn}, and {@link Logger.error error}
 * methods in the same manner that you would use the `console` methods with the same names. The prefix
 * will be generated and prepended to the appropriate console message automatically.
 *
 * If you are only logging a single message with a prefix in your plugin, you may use {@link log}, {@link warn}, or {@link error}
 * instead of creating a `Logger`. Otherwise, using this class is much more convenient than specifying
 * the type, name, and color for every message.
 *
 * Example usage:
 * ```ts
 * import { Logger } from "recelled";
 *
 * const pluginLogger = Logger.plugin("SilentTyping");
 * pluginLogger.log("Hello", "world"); // Logs `[ReCelled:Plugin:SilentTyping] Hello world`
 * ```
 */
export class Logger {
  public type: LoggerType;
  public name: string;
  public color: string;

  /**
   *
   * @param type Type of the context (e.g. API, Plugin, Coremod...)
   * @param name Name of the context (e.g. Notices, SilentTyping, Badges...)
   * @param color Color of the prefix as hex or a CSS color
   */
  public constructor(type: LoggerType, name: string, color: string = blurple) {
    this.type = type;
    this.name = name;
    this.color = color;
  }

  /**
   * Logs a message to the console, with an identifying prefix managed by the Logger instance.
   * @param data Item(s) to print as a message
   * @remarks The arguments for this method are the same as the arguments for `console.log`.
   */
  public log(...data: Parameters<typeof console.log>): void {
    log(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs a warning to the console, with an identifying prefix managed by the Logger instance.
   * @param data Item(s) to print as a warning
   * @remarks The arguments for this method are the same as the arguments for `console.warn`.
   */
  public warn(...data: Parameters<typeof console.warn>): void {
    warn(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs an error to the console, with an identifying prefix managed by the Logger instance.
   * @param data Item(s) to print as an error
   * @remarks The arguments for this method are the same as the arguments for `console.error`.
   */
  public error(...data: Parameters<typeof console.error>): void {
    error(this.type, this.name, this.color, ...data);
  }

  /**
   * Convenience method to create a new {@link Logger} for an API.
   * @internal
   * @param name Name of the API
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link Logger} with type "API"
   */
  public static api(name: string, color?: string): Logger {
    return new Logger("API", name, color);
  }

  /**
   * Convenience method to create a new {@link Logger} for a coremod.
   * @internal
   * @param name Name of the coremod
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link Logger} with type "Coremod"
   */
  public static coremod(name: string, color?: string): Logger {
    return new Logger("Coremod", name, color);
  }

  /**
   * Convenience method to create a new {@link Logger} for a plugin.
   * @param name Name of the plugin
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link Logger} with type "Plugin"
   */
  public static plugin(name: string, color?: string): Logger {
    return new Logger("Plugin", name, color);
  }
}
