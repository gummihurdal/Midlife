/* =====================================================
   PLAYROOM ↔ PCLOUD SYNC
   Two folders in pCloud drive the games:

   1. TEXT FOLDER — every .txt file becomes one card.
      Filename decides where it lands:
        w2-The Name.txt      → Wheel of Desire · Wheel II
        w3-The Name.txt      → Wheel of Desire · Wheel III
        p1-The Name.txt      → Friday Night · Phase 1
        p2h-… / p2t-…        → Friday Night · Heat, Heads / Tails
        p3win-… / p3lose-… / p3wild-…  → Friday Night · Wildfire
        p4red-… / p4black-…  → Friday Night · Vault
      The part after the dash is the card's name.
      The file's contents are the card's text.

   2. IMAGE FOLDER — every jpg/png/gif/webp becomes a
      Gallery card, drawable from both games.

   Setup: in pCloud, right-click each folder → Share →
   Share link. Paste the code (the part after code= or
   the last segment of the link) into the two constants
   below. That's the whole configuration.
   ===================================================== */

var PCLOUD_TEXT_CODE  = "";   /* ← paste text-folder link code here  */
var PCLOUD_IMAGE_CODE = "";   /* ← paste image-folder link code here */

window.PCSync = (function () {
  var HOSTS = ["https://eapi.pcloud.com", "https://api.pcloud.com"];

  function j(url) { return fetch(url).then(function (r) { return r.json(); }); }

  function tryHosts(pathq) {
    var i = 0;
    function attempt() {
      if (i >= HOSTS.length) return Promise.reject("no pcloud host answered");
      var h = HOSTS[i++];
      return j(h + pathq).then(function (d) {
        if (d && d.result === 0) return { host: h, data: d };
        return attempt();
      }).catch(attempt);
    }
    return attempt();
  }

  function listFolder(code) {
    return tryHosts("/showpublink?code=" + encodeURIComponent(code)).then(function (r) {
      var meta = r.data.metadata;
      var files = ((meta && meta.contents) || []).filter(function (f) { return !f.isfolder; });
      return { host: r.host, files: files };
    });
  }

  function dlUrl(host, code, fileid) {
    return j(host + "/getpublinkdownload?code=" + encodeURIComponent(code) + "&fileid=" + fileid)
      .then(function (d) {
        if (d.result !== 0) throw d;
        return "https://" + d.hosts[0] + d.path;
      });
  }

  function load(cb) {
    var out = { cards: {}, images: [] };
    var jobs = [];

    if (PCLOUD_TEXT_CODE) {
      jobs.push(listFolder(PCLOUD_TEXT_CODE).then(function (r) {
        var txt = r.files.filter(function (f) { return /\.txt$/i.test(f.name); });
        return Promise.all(txt.map(function (f) {
          return dlUrl(r.host, PCLOUD_TEXT_CODE, f.fileid)
            .then(function (u) { return fetch(u).then(function (x) { return x.text(); }); })
            .then(function (body) {
              var m = f.name.replace(/\.txt$/i, "");
              var dash = m.indexOf("-");
              if (dash < 1) return;
              var key  = m.slice(0, dash).trim().toLowerCase();
              var name = m.slice(dash + 1).trim();
              var text = body.trim().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\r?\n/g,"<br>");
              (out.cards[key] = out.cards[key] || []).push([name, text]);
            })
            .catch(function () {});
        }));
      }).catch(function () {}));
    }

    if (PCLOUD_IMAGE_CODE) {
      jobs.push(listFolder(PCLOUD_IMAGE_CODE).then(function (r) {
        var imgs = r.files.filter(function (f) { return /\.(jpe?g|png|gif|webp)$/i.test(f.name); });
        return Promise.all(imgs.map(function (f) {
          return dlUrl(r.host, PCLOUD_IMAGE_CODE, f.fileid)
            .then(function (u) { out.images.push({ name: f.name.replace(/\.[^.]+$/, ""), url: u }); })
            .catch(function () {});
        }));
      }).catch(function () {}));
    }

    Promise.all(jobs).then(function () { cb(out); });
  }

  return { load: load };
})();
