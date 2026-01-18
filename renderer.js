const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.querySelector('.window-control.minimize');
    const maximizeBtn = document.querySelector('.window-control.maximize');
    const closeBtn = document.querySelector('.window-control.close');

    minimizeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-minimize');
    });

    maximizeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-maximize');
    });

    closeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-close');
    });
});

ipcRenderer.on('window-maximized', () => {
    const maximizeBtn = document.querySelector('.window-control.maximize');
    maximizeBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="3" y="3" width="6" height="6" fill="currentColor"/>
        </svg>
    `;
    maximizeBtn.title = "Восстановить";
});

ipcRenderer.on('window-unmaximized', () => {
    const maximizeBtn = document.querySelector('.window-control.maximize');
    maximizeBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" fill="currentColor"/>
        </svg>
    `;
    maximizeBtn.title = "Развернуть";
});