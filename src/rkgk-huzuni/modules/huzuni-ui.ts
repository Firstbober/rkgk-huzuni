export const huzuniUI = {
  tabs(labels: string[], content: HTMLDivElement[]): HTMLDivElement {
    const uiTabs = document.createElement('div');
    uiTabs.classList.add('huzuni-ui-tabs');

    const uiTabsButtonsContainer = document.createElement('div');
    for (const label of labels) {
      const span = document.createElement('span');
      span.innerText = label;
      uiTabsButtonsContainer.appendChild(span);
    }
    uiTabs.appendChild(uiTabsButtonsContainer);

    const uiTabsContainer = document.createElement('div');
    uiTabsContainer.classList.add('huzuni-ui-tabs-container');
    uiTabsContainer.append(...content);

    uiTabs.appendChild(uiTabsContainer);

    const uiTabsButtons = uiTabs.querySelectorAll('div:first-child>span');
    const uiTabsContent = uiTabs.querySelectorAll(
      '.huzuni-ui-tabs-container>*',
    );

    for (let y = 0; y < uiTabsContent.length; y++) {
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
  },
};
