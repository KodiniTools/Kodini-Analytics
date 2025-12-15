/**
 * KodiniTools Analytics - Privacy-First Tracking
 * 
 * Einbindung:
 * <script src="https://analytics.kodinitools.com/tracker.js" data-api="https://analytics.kodinitools.com/api" defer></script>
 * 
 * Features:
 * - Keine Cookies
 * - Keine IP-Speicherung
 * - Keine User-IDs
 * - < 1KB gzipped
 */
(function() {
  'use strict';

  // Konfiguration aus Script-Tag
  var script = document.currentScript;
  var apiUrl = script?.getAttribute('data-api') || '/api';
  
  // Nur einmal tracken pro Page Load
  var tracked = false;

  /**
   * Sendet Page View an Server
   */
  function trackPageView() {
    if (tracked) return;
    tracked = true;

    // Aktueller Pfad (ohne Query/Hash)
    var path = window.location.pathname;
    
    // Trailing Slash normalisieren
    if (path !== '/' && !path.endsWith('/')) {
      path += '/';
    }

    // Request senden (fire-and-forget)
    try {
      // Navigator.sendBeacon für zuverlässige Übertragung
      if (navigator.sendBeacon) {
        var blob = new Blob(
          [JSON.stringify({ page: path })],
          { type: 'application/json' }
        );
        navigator.sendBeacon(apiUrl + '/track', blob);
      } else {
        // Fallback: fetch
        fetch(apiUrl + '/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: path }),
          keepalive: true
        }).catch(function() {
          // Fehler still ignorieren
        });
      }
    } catch (e) {
      // Fehler still ignorieren
    }
  }

  // Tracking bei Page Load
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // Optional: SPA-Navigation tracken (für Vue Router)
  // Nur aktivieren wenn History API genutzt wird
  var originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    tracked = false;
    // Kurzes Delay für Route-Änderung
    setTimeout(trackPageView, 100);
  };

  window.addEventListener('popstate', function() {
    tracked = false;
    setTimeout(trackPageView, 100);
  });
})();
