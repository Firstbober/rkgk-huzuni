export const topPanel = {
  getPanelElement() {
    return document.querySelectorAll('#panels-overlay .rkgk-panel')[0];
  },

  test() {
    return topPanel.getPanelElement() != undefined;
  },

  // Appends HTML element at the start of the panel
  appendStart(element: HTMLElement, href?: string) {
    const panelElement = topPanel.getPanelElement();

    const a = document.createElement('a');
    a.appendChild(element);
    if (href) a.href = href;

    panelElement.insertBefore(
      document.createElement('hr'),
      panelElement.firstChild,
    );
    panelElement.insertBefore(a, panelElement.firstChild);
  },
  // Appends HTML element at the end of the panel
  appendEnd(element: HTMLElement, href?: string) {
    const panelElement = topPanel.getPanelElement();

    const a = new HTMLAnchorElement();
    a.appendChild(element);
    if (href) a.href = href;

    panelElement.appendChild(document.createElement('hr'));
    panelElement.appendChild(element);
  },
};

export const rightPanel = {
  getPanelElement(): HTMLDivElement {
    return document.querySelectorAll(
      'div#panels-overlay.panels.fullscreen div.right',
    )[0] as HTMLDivElement;
  },

  test() {
    if (rightPanel.getPanelElement() == undefined) return false;

    rightPanel.getPanelElement().style['flexWrap'] = 'wrap';
    return true;
  },

  appendEnd(element: HTMLElement) {
    const panel = rightPanel.getPanelElement();
    element.style['marginLeft'] += '16px';
    element.style['width'] += '100%';
    element.style['marginTop'] += '8px';
    element.classList.add('rkgk-panel');

    panel.appendChild(element);
  },
};
