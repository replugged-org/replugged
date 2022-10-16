const blurple = '#5865F2';

const repluggedPrefix = (type: string, name: string) => `%c[Replugged:${type}:${name}]`;

const logColor = (color: string) => `color: ${typeof color === 'string' ? color : blurple}`;

export function log (type: string, name: string, color: string = blurple, ...data: unknown[]) {
  console.log(repluggedPrefix(type, name), logColor(color), ...data);
}

export function warn (type: string, name: string, color: string = blurple, ...data: unknown[]) {
  console.warn(repluggedPrefix(type, name), logColor(color), ...data);
}

export function error (type: string, name: string, color: string = blurple, ...data: unknown[]) {
  console.error(repluggedPrefix(type, name), logColor(color), ...data);
}

export class Logger {
  type: string;
  name: string;
  color: string;

  constructor (type: string, name: string, color: string = blurple) {
    this.type = type;
    this.name = name;
    this.color = color;
  }

  log (...data: unknown[]) {
    log(this.type, this.name, this.color, ...data);
  }

  warn (...data: unknown[]) {
    warn(this.type, this.name, this.color, ...data);
  }

  error (...data: unknown[]) {
    error(this.type, this.name, this.color, ...data);
  }
}
