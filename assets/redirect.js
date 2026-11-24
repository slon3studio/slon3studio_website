// Old address (/pages/...): go to the new page and keep any ?query or #section from the link.
(function () {
  var m = document.querySelector('meta[http-equiv="refresh"]');
  var url = m && m.getAttribute("content").split("url=")[1];
  if (!url) return;
  // A local preview server doesn't map /page to page.html like GitHub Pages does.
  var local = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (local && !/\/$/.test(url)) url += ".html";
  location.replace(url + location.search + location.hash);
})();
