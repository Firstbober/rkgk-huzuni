import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

const CSS = `
.scripts-custom-variables {
  .variables {
    display: flex;
    flex-direction: column;

    .variable {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 0fr;
      gap: 4px;

      .remove {
        padding: 0;
        padding-left: 8px;
        padding-right: 8px;
        color: var(--color-error);
      }

      .value {
        display: flex;
        justify-content: center;
      }
    }
  }
}

`;

export class CustomVariables implements HuzuniScript {
  api: HuzuniAPI;

  createVariable() {
    const root = document.createElement('div');
    root.className = 'variable';
    root.innerHTML = `
      <select class="type">
        <option value="color">Color</option>
      </select>

      <input type="text" placeholder="Name of variable" />

      <div class="value">
        <input type="color" />
      </div>

      <button class="remove">X</button>
    `;

    return root;
  }

  start(api: HuzuniAPI): void {
    this.api = api;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.body.appendChild(style);

    const root = document.createElement('div');
    root.className = 'scripts-custom-variables';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.marginTop = '6px';
    root.innerHTML = `
      <span style="font-weight: bold; font-size: 1rem">Custom Variables</span>
      <div class="variables">

      </div>
      <button class="add" style ="width: fit-content; margin-top: 8px">Add</button>
    `;
    // <span>None right now :)</span>

    root.querySelector('.variables').appendChild(this.createVariable());

    api.rightPanel.getBrushEditorElement().appendChild(root);
  }
  stop(): void {}
}
