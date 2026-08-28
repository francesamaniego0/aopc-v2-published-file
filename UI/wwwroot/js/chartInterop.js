// Chart.js interop for Blazor. Keeps a registry of live Chart instances keyed by canvas id so we
// can update/destroy them across Blazor re-renders without leaking.
window.aopcCharts = window.aopcCharts || {};

window.chartInterop = {
    render: function (canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        // Destroy any prior instance on this canvas before drawing a new one.
        if (window.aopcCharts[canvasId]) {
            window.aopcCharts[canvasId].destroy();
            delete window.aopcCharts[canvasId];
        }

        const ctx = canvas.getContext('2d');
        window.aopcCharts[canvasId] = new Chart(ctx, config);
    },

    destroy: function (canvasId) {
        if (window.aopcCharts[canvasId]) {
            window.aopcCharts[canvasId].destroy();
            delete window.aopcCharts[canvasId];
        }
    }
};

// Native scroll-snap carousel helper for the dashboard's Top-3 cards.
window.dashboardInterop = {
    scrollCarousel: function (elementId, direction) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const card = el.querySelector('.dash-card');
        const step = card ? card.getBoundingClientRect().width + 10 : el.clientWidth;
        el.scrollBy({ left: direction * step, behavior: 'smooth' });
    }
};
