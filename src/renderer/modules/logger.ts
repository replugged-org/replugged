/* eslint-disable @typescript-eslint/no-unsafe-argument, no-console */

const DEFAULT_COLOR = "#5865F2"; // Blurple

export type LoggerType =
  | "Plugin"
  | "Coremod"
  | "API"
  | "Ignition"
  | "CommonModules"
  | "Components"
  | "Manager";

export type LogLevel = "log" | "warn" | "error" | "info" | "debug";

const print = (
  level: LogLevel,
  type: LoggerType,
  name: string,
  color: string,
  data: unknown[],
): void => {
  const prefix = `%c[Replugged:${type}:${name}]`;
  const style = `color: ${color || DEFAULT_COLOR}`;
  console[level](prefix, style, ...data);
};

/**
 * Logs a message to the console with a Replugged prefix.
 * @param type The context type of this log message, e.g. "Plugin" or "Coremod".
 * @param name The context name of this log message, e.g. the name of the plugin or coremod.
 * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
 * @param data The item(s) to log.
 */
export const log = (
  type: LoggerType,
  name: string,
  color: string = DEFAULT_COLOR,
  ...data: Parameters<typeof console.log>
): void => print("log", type, name, color, data);

/**
 * Logs a warning message to the console with a Replugged prefix.
 * @param type The context type of this log message, e.g. "Plugin" or "Coremod".
 * @param name The context name of this log message, e.g. the name of the plugin or coremod.
 * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
 * @param data The item(s) to log.
 */
export const warn = (
  type: LoggerType,
  name: string,
  color: string = DEFAULT_COLOR,
  ...data: Parameters<typeof console.warn>
): void => print("warn", type, name, color, data);

/**
 * Logs an error message to the console with a Replugged prefix.
 * @param type The context type of this log message, e.g. "Plugin" or "Coremod".
 * @param name The context name of this log message, e.g. the name of the plugin or coremod.
 * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
 * @param data The item(s) to log.
 */
export const error = (
  type: LoggerType,
  name: string,
  color: string = DEFAULT_COLOR,
  ...data: Parameters<typeof console.error>
): void => print("error", type, name, color, data);

/**
 * Logs an informational message to the console with a Replugged prefix.
 * @param type The context type of this log message, e.g. "Plugin" or "Coremod".
 * @param name The context name of this log message, e.g. the name of the plugin or coremod.
 * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
 * @param data The item(s) to log.
 */
export const info = (
  type: LoggerType,
  name: string,
  color: string = DEFAULT_COLOR,
  ...data: Parameters<typeof console.info>
): void => print("info", type, name, color, data);

/**
 * Logs a verbose message to the console with a Replugged prefix.
 * @param type The context type of this log message, e.g. "Plugin" or "Coremod".
 * @param name The context name of this log message, e.g. the name of the plugin or coremod.
 * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
 * @param data The item(s) to log.
 */
export const verbose = (
  type: LoggerType,
  name: string,
  color: string = DEFAULT_COLOR,
  ...data: Parameters<typeof console.debug>
): void => print("debug", type, name, color, data);

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
 * @example
 * ```ts
 * import { Logger } from "replugged";
 *
 * const pluginLogger = Logger.plugin("SilentTyping");
 * pluginLogger.log("Hello", "world"); // Logs `[Replugged:Plugin:SilentTyping] Hello world`
 * ```
 */
export class Logger {
  public type: LoggerType;
  public name: string;
  public color: string;

  /**
   * @param type The context type of this logger, e.g. "Plugin" or "Coremod".
   * @param name The context name of this logger, e.g. the name of the plugin or coremod.
   * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
   */
  public constructor(type: LoggerType, name: string, color: string = DEFAULT_COLOR) {
    this.type = type;
    this.name = name;
    this.color = color;
  }

  /**
   * Logs a message at the "log" level, which is the default logging level.
   * This is useful for logging general messages that are not warnings or errors.
   * @param data The item(s) to log.
   */
  public log(...data: Parameters<typeof console.log>): void {
    log(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs a message at the "warn" level, which is visually distinct from regular logs.
   * This is useful for logging warning messages that indicate a potential issue or something that should be noted, but may not necessarily be a problem.
   * @param data The item(s) to log.
   */
  public warn(...data: Parameters<typeof console.warn>): void {
    warn(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs a message at the "error" level, which is visually distinct from regular logs and warnings.
   * This is useful for logging error messages that indicate a failure or problem that needs attention.
   * @param data The item(s) to log.
   */
  public error(...data: Parameters<typeof console.error>): void {
    error(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs a message at the "info" level, which is visually distinct from regular logs.
   * This is useful for logging informational messages that are more important than regular logs, but not as severe as warnings or errors.
   * @param data The item(s) to log.
   */
  public info(...data: Parameters<typeof console.info>): void {
    info(this.type, this.name, this.color, ...data);
  }

  /**
   * Logs a message at the "verbose" level, which is only visible when verbose logging is enabled in the console.
   * This is useful for logging detailed information that may be too noisy for regular logging, but can be helpful for debugging.
   * @param data The item(s) to log.
   */
  public verbose(...data: Parameters<typeof console.debug>): void {
    verbose(this.type, this.name, this.color, ...data);
  }

  /**
   * Convenience method to create a new {@link Logger} for an API.
   * @param name The name of the API.
   * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
   * @returns A {@link Logger} instance with the type set to "API".
   * @internal
   */
  public static api(name: string, color?: string): Logger {
    return new Logger("API", name, color);
  }

  /**
   * Convenience method to create a new {@link Logger} for a coremod.
   * @param name The name of the coremod.
   * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
   * @returns A {@link Logger} instance with the type set to "Coremod".
   * @internal
   */
  public static coremod(name: string, color?: string): Logger {
    return new Logger("Coremod", name, color);
  }

  /**
   * Convenience method to create a new {@link Logger} for a manager.
   * @param name The name of the manager.
   * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
   * @returns A {@link Logger} instance with the type set to "Manager".
   * @internal
   */
  public static manager(name: string, color?: string): Logger {
    return new Logger("Manager", name, color);
  }

  /**
   * Convenience method to create a new {@link Logger} for a plugin.
   * @param name The name of the plugin.
   * @param color The color of the prefix. This should be a valid CSS color string. If not specified, it defaults to a blurple color.
   * @returns A {@link Logger} instance with the type set to "Plugin".
   */
  public static plugin(name: string, color?: string): Logger {
    return new Logger("Plugin", name, color);
  }
}
