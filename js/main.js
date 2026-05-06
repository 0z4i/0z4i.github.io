const APP = document.getElementById("app");

async function fetchJSON(path) {
  try {
    const res = await fetch(path);

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    APP.innerHTML = `<p>[error loading data]</p>`;
  }
}

function sortByOrderDesc(arr) {
  return arr.sort((a, b) => b.order - a.order);
}

function getUniqueCategories(posts) {
  return [...new Set(posts.flatMap(p => p.categories))];
}

function navigateToPost(file) {
  APP.innerHTML = `
    <div style="opacity:0.7">
      <p>[loading ${decodeURIComponent(file)}]</p>
    </div>
  `;

  window.location.hash = `#post=${file}`;
}

async function loadPosts() {
  const data = await fetchJSON("posts.json");
  if (!data) return;

  const posts = sortByOrderDesc(data.posts);
  const categories = getUniqueCategories(posts);

  let html = `
    <h1>[posts]</h1>

    <div class="categories">
  `;

  categories.forEach(cat => {
    html += `<button onclick="window.filterCategory('${cat}')">${cat}</button>`;
  });

  html += `
      <button onclick="window.loadPosts()">[ALL]</button>
    </div>

    <div id="post-list"></div>
  `;

  APP.innerHTML = html;

  renderPostList(posts);
}

function renderPostList(posts) {
  const container = document.getElementById("post-list");

  if (!posts.length) {
    container.innerHTML = `<p>[no posts found]</p>`;
    return;
  }

  container.innerHTML = posts.map(renderPostItem).join("");
}

function renderPostItem(p) {
  return `
    <div class="post"
         onclick="window.navigateToPost('${encodeURIComponent(p.file)}')"
         onmouseenter="window.prefetchPost('${encodeURIComponent(p.file)}')">
      <h2>${p.name}</h2>
      <div class="tags">
        ${p.categories.map(c => `<span>[${c}]</span>`).join("")}
      </div>
    </div>
  `;
}

async function filterCategory(category) {
  const data = await fetchJSON("posts.json");
  if (!data) return;

  const filtered = data.posts.filter(p =>
    p.categories.includes(category)
  );

  renderPostList(sortByOrderDesc(filtered));
}

const postCache = {};

async function prefetchPost(file) {
  const decoded = decodeURIComponent(file);

  if (postCache[decoded]) return;

  try {
    const res = await fetch(`posts/${decoded}`);
    if (!res.ok) return;

    postCache[decoded] = await res.text();
  } catch {}
}

async function loadPost(file) {
  try {
    const decodedFile = decodeURIComponent(file);

    const data = await fetchJSON("posts.json");
    if (!data) return;

    const postMeta = data.posts.find(p => p.file === decodedFile);

    let html;

    if (postCache[decodedFile]) {
      html = postCache[decodedFile];
    } else {
      const res = await fetch(`posts/${decodedFile}`);
      if (!res.ok) throw new Error("Post not found");
      html = await res.text();
    }

    let attachmentHTML = "";

    if (postMeta && postMeta.attachment) {
      const attachmentFile = encodeURIComponent(postMeta.attachment);

      attachmentHTML = `
        <div class="attachment">
          <p>${postMeta.attachment_description || "[attachment available]"}</p>
          <a href="drops/${attachmentFile}" download>
            [download attachment]
          </a>
        </div>
      `;
    }

    APP.innerHTML = `
      <button onclick="window.location.hash='#posts'">[← back]</button>

      ${attachmentHTML}

      <div class="post-content">
        ${html}
      </div>
    `;

  } catch (err) {
    console.error(err);
    APP.innerHTML = `<p>[error loading post]</p>`;
  }
}

async function loadDrops() {
  const data = await fetchJSON("drops.json");
  if (!data) return;

  const drops = sortByOrderDesc(data.drops);

  let html = `
    <h1>[deaddrop]</h1>
    <div id="drop-list"></div>
  `;

  APP.innerHTML = html;

  renderDropList(drops);
}

function renderDropList(drops) {
  const container = document.getElementById("drop-list");

  if (!drops.length) {
    container.innerHTML = `<p>[no drops available]</p>`;
    return;
  }

  container.innerHTML = drops.map(renderDropItem).join("");
}

function renderDropItem(d) {
  return `
    <div class="drop">
      <h2>${d.name}</h2>
      <p>${d.description || ""}</p>
      <div class="tags">
        ${(d.category || []).map(c => `<span>[${c}]</span>`).join("")}
      </div>
      <a href="drops/${encodeURIComponent(d.file)}" download>
        [download]
      </a>
    </div>
  `;
}

window.loadPosts = loadPosts;
window.loadPost = loadPost;
window.loadDrops = loadDrops;
window.filterCategory = filterCategory;
window.navigateToPost = navigateToPost;