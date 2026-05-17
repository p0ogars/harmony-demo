#!/usr/bin/env tsx
import { program } from 'commander';
import 'dotenv/config';
import fs from 'node:fs/promises';
import { WaveFile } from 'wavefile';

program
  .name('harmony-ingest')
  .description('Ingest an audio file (WAV/OGG) using Harmony')
  .argument('&lt;file&gt;', 'Path to audio file')
  .action(async (filePath: string) =&gt; {
    const buffer = await fs.readFile(filePath);

    // Convert to 16kHz mono PCM Int16Array for Harmony
    const wav = new WaveFile(buffer);
    wav.toSampleRate(16000);
    wav.toMono();
    wav.toBitDepth('16');

    const pcm = new Int16Array(wav.data.samples);

    console.log('file=', filePath, 'samples=', pcm.length);
    // TODO: integrate with HarmonyEncoding / API
  });

program.parse();
