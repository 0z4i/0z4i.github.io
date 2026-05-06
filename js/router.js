function getHash() {
  return window.location.hash || "";
}

function parseRoute(hash) {
  if (hash.startsWith("#post=")) {
    const file = hash.split("=")[1];
    return { type: "post", file };
  }

  if (hash === "#drops") {
    return { type: "drops" };
  }

  return { type: "posts" };
}

function renderRoute() {
  const hash = getHash();
  const route = parseRoute(hash);

  switch (route.type) {
    case "post":
      window.loadPost(route.file);
      break;

    case "drops":
      window.loadDrops();
      break;

    case "posts":
    default:
      window.loadPosts();
      break;
  }
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", renderRoute);