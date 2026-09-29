window.aopcInterop = {
    watchCapsLock: function (element, dotnetRef) {
        if (!element) return;
        element.addEventListener('keyup', function (e) {
            const isOn = !!(e.getModifierState && e.getModifierState('CapsLock'));
            dotnetRef.invokeMethodAsync('OnCapsLockChanged', isOn);
        });
    },

    // Saves a base64 payload (from a server-fetched file) as a browser download.
    downloadFile: function (filename, base64, contentType) {
        const link = document.createElement('a');
        link.href = 'data:' + (contentType || 'application/octet-stream') + ';base64,' + base64;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Persists the dark-mode preference across reloads (Blazor Server's UiState is circuit-scoped
    // and otherwise resets to Light on every reconnect).
    getDarkMode: function () {
        return localStorage.getItem('aopc-dark-mode') === '1';
    },
    setDarkMode: function (isDark) {
        localStorage.setItem('aopc-dark-mode', isDark ? '1' : '0');
    },

    // Persists the desktop sidebar collapse preference across reloads, same rationale as dark mode.
    getSidebarCollapsed: function () {
        return localStorage.getItem('aopc-sidebar-collapsed') === '1';
    },
    setSidebarCollapsed: function (isCollapsed) {
        localStorage.setItem('aopc-sidebar-collapsed', isCollapsed ? '1' : '0');
    },

    // Two-tone notification chime for new support tickets (SignalR push) — synthesized via
    // WebAudio so no binary audio asset needs to be added to the project.
    playNotificationSound: function () {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            [880, 1320].forEach(function (freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, now + i * 0.14);
                gain.gain.linearRampToValueAtTime(0.2, now + i * 0.14 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.25);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.14);
                osc.stop(now + i * 0.14 + 0.26);
            });
        } catch (e) { /* best-effort — a blocked/unsupported AudioContext must never break the page */ }
    }
};
