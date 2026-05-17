import { HarmonyEncoding } from 'harmony';

export type StreamingRequest = {
  apiKey?: string;
  endpoint?: string;
  sampleRate?: number;
};

export class HarmoneyStreamingSession {
  private encoding: HarmoneyEncoding;
  private buffer: Int16Array;

  constructor(private readonly request: StreamingRequest = {}) {
    this.encoding = new HarmoneyEncoding({ apiKey: request.apiKey });
    this.buffer = new Int16Array(0);
  }

  appendSamples(samples: Int16Array): void {
    const next = new Int16Array(this.buffer.length + samples.length);
    next.set(this.buffer, 0);
    next.set(samples, this.buffer.length);
    this.buffer = next;
  }

  async finalize(): Promise<unknown> {
    // TODO: wire to Harmony API using request.endpoint / request.apiKey
    return { status: 'ok', samples: this.buffer.length };
  }
}
