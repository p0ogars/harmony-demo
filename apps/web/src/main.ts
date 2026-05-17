import './app';
import { createStreamingSession } from './streaming';

// Preload AudioContext on user interaction (autoplay policy)
window.addEventListener(
  'click',
  () =&gt; {
    void createStreamingSession().then((s) =&gt; s.stop());
  },
  { once: true }
);
