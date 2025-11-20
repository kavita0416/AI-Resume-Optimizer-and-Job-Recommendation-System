// frontend/front-config.js
(function () {
  // Config — change PORT here if you ever want a different backend port
  const API_PORT = 5000;

  // Build API base using same hostname the page was served from.
  const HOST = location.hostname;
  const SCHEME = location.protocol; // includes trailing ':'
  const ORIGIN = `${SCHEME}//${HOST}`;

  // Always point to port 5000 on the current host (dev backend)
  const API_BASE = `${SCHEME}//${HOST}:${API_PORT}`;

  // Expose globals used across your frontend (do not overwrite if already set)
  window.ER_API = window.ER_API || API_BASE;
  window.API_BASE = window.API_BASE || API_BASE;
  window.ER_API_PORT = window.ER_API_PORT || API_PORT;
  window.FRONTEND_ORIGIN = window.FRONTEND_ORIGIN || ORIGIN;

  // Simple helper to get currently stored auth
  window.getAuth = window.getAuth || function () {
    return {
      token: localStorage.getItem("er_token"),
      user: JSON.parse(localStorage.getItem("er_user") || "null"),
    };
  };

  
  window.erFetch = window.erFetch || async function (pathOrUrl, opts = {}) {
    opts = Object.assign({}, opts); // shallow copy to avoid mutating callers

    const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
    const url = isAbsolute
      ? pathOrUrl
      : `${(window.ER_API || API_BASE)}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

    opts.headers = opts.headers ? Object.assign({}, opts.headers) : {};

    // attach token if present and not already provided
    const token = localStorage.getItem("er_token");
    if (token && !opts.headers.Authorization && !opts.headers["Authorization"]) {
      opts.headers["Authorization"] = `Bearer ${token}`;
    }

    // If body is not FormData and Content-Type is not set, default to JSON
    if (!(opts.body instanceof FormData) && !opts.headers["Content-Type"] && !opts.headers["content-type"]) {
      opts.headers["Content-Type"] = "application/json";
    }

    return fetch(url, opts);
  };

  // small debug line
  console.info("[front-config] ER_API =", window.ER_API, "| FRONTEND_ORIGIN =", window.FRONTEND_ORIGIN, "| erFetch ready");
})();
