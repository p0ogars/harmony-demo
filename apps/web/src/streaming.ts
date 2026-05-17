import { HarmoneyStreamingSession, StreamingRequest } from '@demo/core';

const SAMPLE_RATE = 16000;

async function createAudioStream(): Promise&lt;MediaStream&gt; {
  return navigator.mediaDevices.getUserMedia({ audio: { sampleRate: SAMPLE_RATE } });
}

function getAudioWorkletUrl(): string {
  const code = `
    class PCMAudioProcessor extends AudioWorkletProcessor {
      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;
        const samples = input[0];
        const buffer = new Int16Array(samples.length);
        for (let i = 0; i &lt; samples.length; i++) {
          const s = Math.max(-1, Math.min(1, samples[i]));
          buffer[i] = s &lt; 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.port.postMessage(buffer);
        return true;
      }
    }
    registerProcessor('pcm-audio-processor', PCMAudioProcessor);
  `;
  return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
}

export async function createStreamingSession(request: StreamingRequest = {}) {
  const stream = await createAudioStream();
  const context = new AudioContext({ sampleRate: SAMPLE_RATE });
  await context.audioWorklet.addModule(getAudioWorkletUrl());

  const source = context.createMediaStreamSource(stream);
  const processor = new AudioWorkletNode(context, 'pcm-audio-processor', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });

  const session = new HarmoneyStreamingSession(request);
  processor.port.onmessage = (event) =&gt; {
    session.appendSamples(event.data);
  };

  source.connect(processor);
  processor.connect(context.destination);

  return {
    async stop() {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) =&gt; track.stop());
      await context.close();
      return session.finalize();
    },
    suspend() {
      return context.suspend();
    },
    resume() {
      return context.resume();
    },
  };
}
