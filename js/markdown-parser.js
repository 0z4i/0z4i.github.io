const POSTS_FOLDER = 'posts/';


function loadDynamicPostList(targetElementId) {
    const listContainer = document.getElementById(targetElementId);
    
    fetch(POSTS_FOLDER + 'posts.manifest')
        .then(response => {
            if (!response.ok) {
                listContainer.innerHTML = `<p class="alerta-error">ERROR: No se encontró el manifest de posts. Asegúrate de que existe 'posts/posts.manifest'.</p>`;
                throw new Error("Manifest no encontrado.");
            }
            return response.text();
        })
        .then(text => {
            const postData = text.split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0 && !line.startsWith('#'))
                                  .map(line => {
                                      const [fileName, category] = line.split('|').map(s => s.trim());
                                      return { fileName, category };
                                  })
                                  .sort((a, b) => b.fileName.localeCompare(a.fileName)); 
            renderPostList(postData, targetElementId);
        })
        .catch(error => {
            console.error(error);
        });
}

function renderPostList(postData, targetElementId) {
    const listContainer = document.getElementById(targetElementId);
    listContainer.innerHTML = '';
    
    postData.forEach(post => {
        
        const match = post.fileName.match(/(\d{4}-\d{2}-\d{2})-(.*)\.md/);
        
        if (match) {
            const date = match[1];
            const title = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const categoryDisplay = post.category || 'Sin Categoría'; 

            const card = document.createElement('a');
            card.href = `post.html?file=${post.fileName}`;
            card.className = 'post-card neon-border';
            card.innerHTML = `
                <span class="card-date">${date}</span>
                <h3 class="card-title">${title}</h3>
                <span class="card-category">[${categoryDisplay.toUpperCase()}]</span>
            `;
            listContainer.appendChild(card);
        }
    });
}

function loadAndRenderPost(fileName, targetElementId) {
    fetch(POSTS_FOLDER + fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo: ${fileName}`);
            }
            return response.text();
        })
        .then(markdownText => {
            const parts = markdownText.split('---');
            let content = markdownText;
            let metaData = {};
            
            if (parts.length >= 3) {
                 content = parts.slice(2).join('---'); 
            }

            const htmlContent = marked.parse(content);

            document.getElementById(targetElementId).innerHTML = htmlContent;
        })
        .catch(error => {
            console.error(error);
            document.getElementById(targetElementId).innerHTML = `<h2>ERROR:: No se pudo cargar el artículo (${fileName}).</h2>`;
        });
}