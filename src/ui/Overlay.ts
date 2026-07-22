/** A full-screen centered modal overlay (start / pause / result screens). */
export class Overlay {
  readonly root: HTMLDivElement;
  readonly panel: HTMLDivElement;

  constructor(parent: HTMLElement, extraClass = '') {
    this.root = document.createElement('div');
    this.root.className = `overlay ${extraClass}`.trim();
    this.panel = document.createElement('div');
    this.panel.className = 'overlay-panel';
    this.root.appendChild(this.panel);
    parent.appendChild(this.root);
  }

  show(): void {
    this.root.classList.add('show');
  }

  hide(): void {
    this.root.classList.remove('show');
  }

  get visible(): boolean {
    return this.root.classList.contains('show');
  }
}
