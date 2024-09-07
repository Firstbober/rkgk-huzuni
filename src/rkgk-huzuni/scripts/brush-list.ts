import { HuzuniAPI, HuzuniScript } from '../huzuni-api';

export class BrushList implements HuzuniScript {
  api: HuzuniAPI;

  brushListRoot: HTMLDivElement;
  brushList: HTMLSelectElement;
  removeButton: HTMLButtonElement;

  brushes = new Map<
    string,
    {
      code: string;
      name: string;
    }
  >();
  reservedBrushes = ['last-session', 'default-1'];

  addBrush() {
    const ids: string[] = [];
    for (const option of this.brushList.options) {
      ids.push(option.value);
    }

    let brushId = `New Brush`;
    let iteration = 1;
    while (ids.includes(brushId)) {
      brushId = `New Brush ${iteration}`;
      iteration += 1;
    }

    const option = document.createElement('option');
    option.value = brushId;
    option.text = brushId;

    this.brushList.options.add(option);
    this.brushList.value = brushId;

    this.removeButton.disabled = false;

    this.brushes.set(brushId, {
      name: brushId,
      code: '',
    });
  }
  removeBrush(name: string) {
    this.brushes.delete(name);
    localStorage.setItem(
      'huzuni.brush-list.brushes',
      JSON.stringify(Object.fromEntries(this.brushes)),
    );
  }
  getBrush(name: string): string {
    return this.brushes.get(name).code;
  }
  changeBrush(name: string, code: string) {
    if (this.reservedBrushes.includes(name)) return;

    if (code.length > 0) {
      if (code[0] == '-') {
        let accumulatedText = '';
        for (const char of code) {
          if (char == '\n') {
            break;
          }
          accumulatedText += char;
        }

        if (accumulatedText.startsWith('--')) {
          for (const option of this.brushList.options) {
            if (option.value != name) continue;
            const newName = accumulatedText.slice(2).trim();
            if (newName.length < 1) break;

            option.text = newName;
            this.brushes.set(name, {
              code,
              name: newName,
            });

            localStorage.setItem(
              'huzuni.brush-list.brushes',
              JSON.stringify(Object.fromEntries(this.brushes)),
            );
            return;
          }
        }
      }
    }

    this.brushes.set(name, {
      code,
      name,
    });

    localStorage.setItem(
      'huzuni.brush-list.brushes',
      JSON.stringify(Object.fromEntries(this.brushes)),
    );
  }

  start(api: HuzuniAPI): void {
    const rkgkCodeEditor = api.rightPanel.getCodeEditor();

    this.brushListRoot = document.createElement('div');
    this.brushListRoot.style.display = 'flex';
    this.brushListRoot.style.marginBottom = '12px';
    this.brushListRoot.innerHTML = `
      <select class="brush-list" style="width: 100%; outline: none; margin-right: 4px;">
        <option value="last-session">Last Session</option>
        <option value="default-1">Default 1</option>
      </select>
      <button style="white-space: nowrap; margin-right:4px" class="new">New</button>
      <button style="background-color:var(--color-error); color: white;" class="remove" disabled>Remove</button>
    `;

    this.brushList = this.brushListRoot.querySelector(
      '.brush-list',
    ) as HTMLSelectElement;
    const newButton = this.brushListRoot.querySelector(
      '.new',
    ) as HTMLButtonElement;
    this.removeButton = this.brushListRoot.querySelector(
      '.remove',
    ) as HTMLButtonElement;

    this.brushList.addEventListener('change', () => {
      const brushId = this.brushList.value;

      // Enable delete button
      this.removeButton.disabled = this.reservedBrushes.includes(brushId);

      if (brushId == 'last-session') {
        rkgkCodeEditor.setCode(
          localStorage.getItem('rkgk.brushEditor.code') ?? ':) no brush saved',
        );
        return;
      }

      if (brushId == 'default-1') {
        rkgkCodeEditor.setCode(
          `
-- This is your brush.
-- Try playing around with the numbers,
-- and see what happens!

stroke 8 #000 (vec 0 0)
`.trim(),
        );
        return;
      }

      rkgkCodeEditor.setCode(this.getBrush(brushId));
    });

    newButton.addEventListener('click', () => {
      this.addBrush();
      rkgkCodeEditor.setCode('');
    });

    this.removeButton.addEventListener('click', () => {
      for (const option of this.brushList.options) {
        if (option.value == this.brushList.value) {
          option.remove();
          this.removeButton.disabled = true;
          this.removeBrush(option.value);
        }
      }
    });

    rkgkCodeEditor.addEventListener('.codeChanged', () => {
      if (!api.enabled) return;

      if (this.reservedBrushes.includes(this.brushList.value)) return;
      this.changeBrush(this.brushList.value, rkgkCodeEditor.code);
    });

    const storageObject = localStorage.getItem('huzuni.brush-list.brushes');
    if (storageObject != null) {
      this.brushes = new Map(Object.entries(JSON.parse(storageObject)));

      for (const [name, brush] of this.brushes.entries()) {
        const option = document.createElement('option');

        option.text = brush.name;
        option.value = name;

        this.brushList.options.add(option);
      }
    }

    const brushEditorPanel = api.rightPanel.getBrushEditorElement();
    brushEditorPanel.insertBefore(
      this.brushListRoot,
      brushEditorPanel.firstChild,
    );
  }
  stop(): void {
    this.brushListRoot.remove();
  }
}
