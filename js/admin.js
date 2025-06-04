let editingId = null;
let adminStockData = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!isSessionValid()) {
        alert('Session expirée. Redirection vers la page de connexion.');
        window.location.href = 'index.html';
        return;
    }

    extendSession();

    loadStockData();

    initAdmin();
});

function loadStockData() {
    const savedData = localStorage.getItem('gallery_stock_data');
    if (savedData) {
        try {
            adminStockData = JSON.parse(savedData);
        } catch (error) {
            console.error('Erreur chargement données:', error);
            adminStockData = [...stockData];
        }
    } else {
        adminStockData = [...stockData];
        saveData();
    }
}

function initAdmin() {
    console.log('Initialisation de l\'interface admin...');

    updateSessionInfo();

    renderQuickStats();
    renderAdminTable();

    initEventListeners();
}

function initEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.getElementById('addBtn').addEventListener('click', () => openModal());

    document.getElementById('closeBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    document.getElementById('contentForm').addEventListener('submit', handleFormSubmit);

    document.getElementById('formModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    setInterval(() => {
        if (isSessionValid()) {
            extendSession();
            updateSessionInfo();
        }
    }, 5 * 60 * 1000);
}

function updateSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    const sessionData = JSON.parse(localStorage.getItem(ADMIN_CONFIG.AUTH_KEY));

    if (sessionData) {
        const remaining = Math.round((sessionData.expires - Date.now()) / (1000 * 60));
        sessionInfo.textContent = `Session: ${remaining}min restantes`;
    }
}

function renderQuickStats() {
    const stats = calculateAdminStats();
    const quickStats = document.getElementById('quickStats');

    quickStats.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.totalItems}</div>
            <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalVideos}</div>
            <div class="stat-label">Vidéos</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalPhotos}</div>
            <div class="stat-label">Photos</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.totalStock}</div>
            <div class="stat-label">Stock Total</div>
        </div>
    `;
}

function getStockClass(stock) {
    if (stock >= 2) return 'stock-high';
    if (stock >= 1) return 'stock-medium';
    return 'stock-low';
}


function calculateAdminStats() {
    const totalItems = adminStockData.length;
    const totalVideos = adminStockData.filter(item => item.type === 'video').length;
    const totalPhotos = adminStockData.filter(item => item.type === 'photo').length;
    const totalStock = adminStockData.reduce((sum, item) => sum + item.stock, 0);

    return {
        totalItems,
        totalVideos,
        totalPhotos,
        totalStock
    };
}

function renderAdminTable() {
    const tableBody = document.getElementById('adminTableBody');

    if (adminStockData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div style="text-align: center; padding: 2rem; color: #718096;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                        <p>Aucun contenu en stock</p>
                        <button class="btn-primary" style="margin-top: 1rem;" onclick="openModal()">
                            ➕ Ajouter le premier contenu
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = adminStockData.map(item => `
        <tr>
            <td><span class="id-badge">${item.id}</span></td>
            <td>
                <div class="title-type">
                    <span class="title-cell">${item.title}</span>
                    <span class="type-badge type-${item.type}">
                        ${item.type === 'video' ? '🎬 Vidéo' : '📸 Photo'}
                    </span>
                </div>
            </td>
            <td class="price-cell">${item.price}</td>
            <td class="stock-cell ${getStockClass(item.stock)}">${item.stock}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editItem('${item.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openModal(itemId = null) {
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('contentForm');

    form.reset();
    editingId = itemId;

    if (itemId) {
        const item = adminStockData.find(stock => stock.id === itemId);
        if (item) {
            modalTitle.textContent = 'Modifier le contenu';
            document.getElementById('contentId').value = item.id;
            document.getElementById('contentTitle').value = item.title;
            document.getElementById('contentType').value = item.type;
            document.getElementById('contentPrice').value = item.price;
            document.getElementById('contentStock').value = item.stock;

            document.getElementById('contentId').disabled = true;
        }
    } else {
        modalTitle.textContent = 'Ajouter un contenu';
        document.getElementById('contentId').disabled = false;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        document.getElementById('contentId').focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('formModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();


    const formData = {
        id: document.getElementById('contentId').value.trim(),
        title: document.getElementById('contentTitle').value.trim(),
        type: document.getElementById('contentType').value,
        price: parseInt(document.getElementById('contentPrice').value),
        stock: parseInt(document.getElementById('contentStock').value)
    };

    if (!formData.id && !editingId) {
        generateAutoId();
        formData.id = document.getElementById('contentId').value;
    }

    if (!formData.id || !formData.title || !formData.type) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    if (formData.price < 0 || formData.stock < 0) {
        showNotification('Le prix et le stock doivent être positifs', 'error');
        return;
    }

    if (editingId) {
        updateItem(formData);
    } else {
        addItem(formData);
    }
}

function addItem(formData) {
    if (adminStockData.find(item => item.id === formData.id)) {
        showNotification('Cet ID existe déjà', 'error');
        return;
    }

    adminStockData.push(formData);

    saveData();
    refreshAdmin();
    closeModal();

    showNotification('Contenu ajouté avec succès', 'success');
}

function updateItem(formData) {
    const index = adminStockData.findIndex(item => item.id === editingId);

    if (index !== -1) {
        formData.id = editingId;
        adminStockData[index] = formData;

        saveData();
        refreshAdmin();
        closeModal();

        showNotification('Contenu modifié avec succès', 'success');
    }
}

function editItem(itemId) {
    openModal(itemId);
}

function deleteItem(itemId) {
    const item = adminStockData.find(stock => stock.id === itemId);

    if (!item) {
        showNotification('Item non trouvé', 'error');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`)) {
        adminStockData = adminStockData.filter(stock => stock.id !== itemId);

        saveData();
        refreshAdmin();

        showNotification('Contenu supprimé avec succès', 'success');
    }
}

function saveData() {
    localStorage.setItem('gallery_stock_data', JSON.stringify(adminStockData));
    console.log('Données sauvegardées:', adminStockData);
}

function refreshAdmin() {
    renderQuickStats();
    renderAdminTable();
}

function handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        destroySession();
        window.location.href = 'index.html';
    }
}

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        background: type === 'success' ? '#38a169' : '#e53e3e'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.getElementById('contentType').addEventListener('change', generateAutoId);

function generateAutoId() {
    const typeSelect = document.getElementById('contentType');
    const idInput = document.getElementById('contentId');

    if (editingId) return;

    const selectedType = typeSelect.value;
    if (!selectedType) {
        idInput.value = '';
        return;
    }

    const prefix = selectedType === 'video' ? 'VID' : 'PHO';

    const existingIds = adminStockData
        .filter(item => item.id.startsWith(prefix))
        .map(item => {
            const numPart = item.id.slice(3);
            return parseInt(numPart, 10);
        })
        .filter(num => !isNaN(num));

    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    const formattedNumber = String(nextNumber).padStart(3, '0');

    const newId = `${prefix}${formattedNumber}`;

    idInput.value = newId;

    idInput.style.background = '#e6fffa';
    setTimeout(() => {
        idInput.style.background = '';
    }, 1000);
}