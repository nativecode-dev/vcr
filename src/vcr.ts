import * as debug from 'debug'
import * as uuid from 'uuid'

export const Console = (frame: Frame): void => {
  const logger = console.log
  logger(frame.tag, ...frame.args)
}

export const Debug = (frame: Frame): void => {
  const logger: debug.IDebugger = debug(frame.tag)
  logger(frame.args)
}

export interface Frame {
  args: any[]
  id: string
  logdate: number
  tag: string
}

export type Formatter = (args: any[]) => any[]
export type Tape = (frame: Frame) => void

export class VCR {
  protected readonly tag: string

  private readonly formatters: Formatter[] = []
  private readonly writers: Tape[] = []

  constructor(tag: string) {
    this.tag = tag
  }

  public extend(tag: string): VCR {
    const vcr = new VCR(this.namespace(tag))
    this.formatters.forEach((formatter) => vcr.formatter(formatter))
    this.writers.forEach((writer) => vcr.use(writer))
    return vcr
  }

  public debug(...args: any[]): VCR {
    return this.write('debug', ...args)
  }

  public error(...args: any[]): VCR {
    return this.write('error', ...args)
  }

  public formatter(formatter: Formatter): VCR {
    this.formatters.push(formatter)
    return this
  }

  public info(...args: any[]): VCR {
    return this.write('info', ...args)
  }

  public use(handler: Tape): VCR {
    this.writers.push(handler)
    return this
  }

  public warn(...args: any[]): VCR {
    return this.write('warn', ...args)
  }

  private namespace(tag: string): string {
    return `${this.tag}:${tag}`
  }

  private write(tag: string, ...args: any[]): VCR {
    const frame: Frame = {
      args,
      id: uuid.v4(),
      logdate: Date.now(),
      tag: this.namespace(tag),
    }

    this.formatters
      .forEach((formatter: Formatter) => frame.args = formatter(frame.args))

    this.writers
      .forEach((tape: Tape) => tape(frame))

    return this
  }
}
