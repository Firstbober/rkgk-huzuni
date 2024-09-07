import uiTabsCSS from './ui/tabs.css';
import uiDialogCSS from './ui/dialog.css';
import uiButtonsFix from './ui/buttonsFix.css';

class HuzuniUI {
  setupCSS() {
    const style = document.createElement('style');
    style.textContent = [uiTabsCSS, uiButtonsFix, uiDialogCSS].join('\n');
    document.body.appendChild(style);
  }

  tabs(labels: string[], content: HTMLElement[]): HTMLElement {
    const uiTabs = document.createElement('div');
    uiTabs.classList.add('huzuni-ui-tabs');

    const uiTabsButtonsContainer = document.createElement('div');
    uiTabsButtonsContainer.classList.add('huzuni-ui-tabs-labels');
    for (const label of labels) {
      const span = document.createElement('span');
      span.innerText = label;
      uiTabsButtonsContainer.appendChild(span);
    }
    uiTabs.appendChild(uiTabsButtonsContainer);

    const uiTabsContainer = document.createElement('div');
    uiTabsContainer.classList.add('huzuni-ui-tabs-container');
    uiTabsContainer.style.display = 'flex';
    uiTabsContainer.style.height = '100%';
    uiTabsContainer.append(
      ...content.map((e) => {
        const d = document.createElement('div');
        d.appendChild(e);
        return d;
      }),
    );

    uiTabs.appendChild(uiTabsContainer);

    const uiTabsButtons = uiTabs.querySelectorAll(
      '.huzuni-ui-tabs-labels>span',
    );
    const uiTabsContent = uiTabs.querySelectorAll(
      '.huzuni-ui-tabs-container>*',
    );

    for (let y = 0; y < uiTabsContent.length; y++) {
      (uiTabsContent[y] as HTMLElement).style.height = '100%';
      (uiTabsContent[y] as HTMLElement).style.width = '100%';
      (uiTabsContent[y] as HTMLElement).style.boxSizing = 'border-box';
      if (y == 0) continue;
      (uiTabsContent[y] as HTMLDivElement).style['display'] = 'none';
    }

    for (let i = 0; i < uiTabsButtons.length; i++) {
      uiTabsButtons[i].addEventListener('click', () => {
        for (let y = 0; y < uiTabsButtons.length; y++) {
          (uiTabsButtons[y] as HTMLDivElement).classList.remove('active');
        }
        uiTabsButtons[i].classList.add('active');

        for (let y = 0; y < uiTabsContent.length; y++) {
          (uiTabsContent[y] as HTMLDivElement).style['display'] =
            y == i ? 'flex' : 'none';
        }
      });
    }

    uiTabsButtons[0].classList.add('active');

    return uiTabs;
  }

  dialog(
    title: string,
    content: HTMLElement,
  ): {
    show: () => void;
    hide: () => void;
  } {
    const root = document.createElement('div');
    root.classList.add('huzuni-ui-dialog-container');

    const dialog = document.createElement('div');
    dialog.classList.add('huzuni-ui-dialog', 'rkgk-panel');
    dialog.innerHTML = `
      <span>${title}</span>
      <div class="element-container" style="height: 100%"></div>
    `;
    dialog.querySelector('.element-container').appendChild(content);

    root.appendChild(dialog);

    document.body.appendChild(root);
    return {
      show: () => {
        root.style.display = 'flex';
      },
      hide: () => {
        root.style.display = 'none';
      },
    };
  }
}

export const huzuniUI = new HuzuniUI();
