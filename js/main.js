function loadStockData() {
    const savedData = localStorage.getItem('gallery_stock_data');
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            console.error('Erreur chargement données:', error);
            return stockData;
        }
    }
    return stockData;
}

function getStockClass(stock) {
    if (stock >= 10) return 'stock-high';
    if (stock >= 5) return 'stock-medium';
    return 'stock-low';
}

function renderTable() {
    const tableBody = document.getElementById('stockTableBody');
    const currentData = loadStockData();

    if (currentData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <p>Aucun stock disponible</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = currentData.map(item => `
        <tr>
            <td>
                <span class="id-badge">${item.id}</span>
            </td>
            <td>
                <div class="title-type">
                    <span class="title-cell">${item.title}</span>
                    <span class="type-badge type-${item.type}">
                        ${item.type === 'video' ? '🎬 Vidéo' : '📸 Photo'}
                    </span>
                </div>
            </td>
            <td class="price-cell">${item.price}</td>
            <td class="stock-cell ${getStockClass(item.stock)}">
                ${item.stock} exemplaire${item.stock > 1 ? 's' : ''}
            </td>
        </tr>
    `).join('');
}

function refreshDisplay() {
    renderTable();
    checkAdminAccess();
}

function checkAdminAccess() {
    const adminAccess = document.getElementById('adminAccess');

    if (typeof isSessionValid === 'function' && isSessionValid()) {
        adminAccess.style.display = 'block';
        adminAccess.classList.add('show');
    } else {
        adminAccess.style.display = 'none';
        adminAccess.classList.remove('show');
    }
}

function goToAdmin() {
    window.location.href = 'admin.html';
}

function startSessionCheck() {
    checkAdminAccess();

    setInterval(checkAdminAccess, 30000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page chargée - Initialisation...');

    setTimeout(() => {
        refreshDisplay();
        startSessionCheck();
    }, 100);
});