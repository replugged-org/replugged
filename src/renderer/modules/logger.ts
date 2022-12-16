const blurple = "#5865F2";

const repluggedPrefix = (type: string, name: string): string => `%c[Replugged:${type}:${name}]`;

const logColor = (color: string): string => `color: ${typeof color === "string" ? color : blurple}`;

export function log(type: string, name: string, color: string = blurple, ...data: unknown[]): void {
  console.log(repluggedPrefix(type, name), logColor(color), ...data);
}

export function warn(
  type: string,
  name: string,
  color: string = blurple,
  ...data: unknown[]
): void {
  console.warn(repluggedPrefix(type, name), logColor(color), ...data);
}

export function error(
  type: string,
  name: string,
  color: string = blurple,
  ...data: unknown[]
): void {
  console.error(repluggedPrefix(type, name), logColor(color), ...data);
}

export class Logger {
  public type: string;
  public name: string;
  public color: string;

  public constructor(type: string, name: string, color: string = blurple) {
    this.type = type;
    this.name = name;
    this.color = color;
  }

  public log(...data: unknown[]): void {
    log(this.type, this.name, this.color, ...data);
  }

  public warn(...data: unknown[]): void {
    warn(this.type, this.name, this.color, ...data);
  }

  public error(...data: unknown[]): void {
    error(this.type, this.name, this.color, ...data);
  }

  public static api(name: string, color?: string): Logger {
    return new Logger("API", name, color);
  }

  public static coremod(name: string, color?: string): Logger {
    return new Logger("Coremod", name, color);
  }

  public static plugin(name: string, color?: string): Logger {
    return new Logger("Plugin", name, color);
  }
}
