#!/usr/bin/env tsx
import { program } from 'commander';
import 'dotenv/config';
import fs from 'node:fs';
import { WaveFile } from 'wavefile';
import { HarmoneyStreamingSession } from '@demo/core';

program
  .name('harmony-stream')
  .description('Stream an audio file through Harmony in near-realtime')
  .argument('&lt;file&gt;', 'Path to audio file')
  .option('-c, --chunk-ms &lt;ms&gt;', 'Chunk duration in ms', '200')
  .action(async (filePath: string, opts: { chunkMs: string }) =&gt; {
    const buffer = await fs.promises.readFile(filePath);
    const wav = new WaveFile(buffer);
    wav.toSampleRate(16000);
    wav.toMono();
    wav.toBitDepth('16');

    const pcm = new Int16Array(wav.data.samples);
    const session = new HarmoneyStreamingSession();

    const chunkMs = Number(opts.chunkMs);
    const chunkSize = Math.floor((16000 * chunkMs) / 1000);

    for (let i = 0; i &lt; pcm.length; i += chunkSize) {
      const chunk = pcm.subarray(i, i + chunkSize);
      session.appendSamples(chunk);
      await new Promise((resolve) =&gt; setTimeout(resolve, chunkMs));
    }

    const result = await session.finalize();
    console.log('Stream complete', result);
  });

program.parse();
