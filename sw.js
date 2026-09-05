/* Service Worker für PhysioNebenbei.
   Zweck: Die Rechner sollen offline funktionieren, wenn die Seite einmal
   zum Home-Bildschirm hinzugefügt wurde. Kein Tracking, keine Netzwerkzugriffe
   nach außen — es wird nur gecacht, was von dieser Domain kommt. */

const CACHE = 'physionebenbei-v23';

/* Nur oeffentliche Dateien vorladen. Der Kundenbereich liegt unter einer
   eigenen Adresse und wird beim ersten Besuch automatisch mitgecacht,
   sobald jemand ihn oeffnet. */
const DATEIEN = [
  './',
  './index.html',
  './inhalt.html',
  './rechner.html',
  './kaufen.html',
  './fragen.html',
  './landing.css',
  './nav.js',
  './rechner.js',
  './physio-nebenbei/base.css',
  './physio-nebenbei/fonts.css',
  './physio-nebenbei/fonts/bricolage-latin.woff2',
  './physio-nebenbei/fonts/bricolage-latin-ext.woff2',
  './physio-nebenbei/fonts/instrument-latin.woff2',
  './physio-nebenbei/fonts/instrument-latin-ext.woff2',
  './physio-nebenbei/zahlenfeld.js',
  './physio-nebenbei/fahrplan.html',
  './physio-nebenbei/logo.svg',
  './physio-nebenbei/icon-192.png',
  './physio-nebenbei/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(DATEIEN))
      .catch(() => {})          // eine fehlende Datei darf die Installation nicht kippen
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  /* Netz zuerst, damit Aktualisierungen ankommen; Cache als Rückfallebene,
     damit die Rechner offline weiterlaufen. */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const kopie = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopie)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(t => t || caches.match('./index.html')))
  );
});
