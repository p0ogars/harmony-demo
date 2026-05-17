import { createStreamingSession } from './streaming';

export class HarmoneyDemoApp extends HTMLElement {
  private session: Awaited&lt;ReturnType&lt;typeof createStreamingSession&gt;&gt; | null = null;
  private btn: HTMLButtonElement | null = null;

  connectedCallback() {
    this.attachShadow({ mode: 'open' }).innerHTML = `
      &lt;style&gt;
        button {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
        }
        button.recording {
          background: #fee2e2;
          border-color: #fecaca;
        }
      &lt;/style&gt;
      &lt;button type="button"&gt;Start streaming&lt;/button&gt;
    `;
    this.btn = this.shadowRoot?.querySelector('button') ?? null;
    this.btn?.addEventListener('click', () =&gt; this.toggle());
  }

  async toggle() {
    if (!this.btn) return;

    if (!this.session) {
      this.session = await createStreamingSession();
      this.btn.textContent = 'Stop streaming';
      this.btn.classList.add('recording');
      return;
    }

    const result = await this.session.stop();
    this.session = null;
    this.btn.textContent = 'Start streaming';
    this.btn.classList.remove('recording');
    console.log('Streaming result', result);
  }
}

customElements.define('harmony-demo-app', HarmoneyDemoApp);
