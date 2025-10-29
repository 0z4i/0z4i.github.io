const DEADDROP_MANIFEST_PATH = 'deaddrop/links.manifest';

function loadDeadDropList(targetElementId) {
    const listContainer = document.getElementById(targetElementId);
    
    fetch(DEADDROP_MANIFEST_PATH)
        .then(response => {
            if (!response.ok) {
                listContainer.innerHTML = `<p class="alerta-error">ERROR: No se encontró el Dead Drop Manifest. Verifica la ruta: ${DEADDROP_MANIFEST_PATH}</p>`;
                throw new Error("Dead Drop Manifest no encontrado.");
            }
            return response.text();
        })
        .then(text => {
            const dropData = text.split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0 && !line.startsWith('#'))
                                  .map(line => {o
                                      const parts = line.split('|').map(s => s.trim());
                                      return { 
                                          url: parts[0], 
                                          title: parts[1] || 'Recurso sin título',
                                          description: parts[2] || 'Recurso de utilidad para el tema.'
                                      };
                                  });

            renderDeadDrop(dropData, listContainer);
        })
        .catch(error => {
            console.error(error);
        });
}

function renderDeadDrop(dropData, container) {
    container.innerHTML = '';
    
    if (dropData.length === 0) {
        container.innerHTML = `<p class="alerta-box">No hay elementos cargados en el Dead Drop aún.</p>`;
        return;
    }
    
    dropData.forEach(item => {
        const dropItem = document.createElement('div');
        dropItem.className = 'deaddrop-item';
        
        dropItem.innerHTML = `
            <a href="${item.url}" target="_blank" class="deaddrop-link">
                ${item.title} 
                <span class="external-icon">[🔗]</span>
            </a>
            <p class="description">${item.description}</p>
        `;
        container.appendChild(dropItem);
    });
}