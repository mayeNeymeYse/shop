const stockData = [
    {
        id: "PHO001",
        title: "Photo de ma bite simple",
        type: "photo",
        price: 1,
        stock: 5
    },
    {
        id: "PHO002",
        title: "Photo de mon cul",
        type: "photo",
        price: 1,
        stock: 1
    },
    {
        id: "VID001",
        title: "Pisse sous la douche",
        type: "video",
        price: 2,
        stock: 2
    },
    {
        id: "VID002",
        title: "Pisse aux toilettes",
        type: "video",
        price: 2,
        stock: 2
    },
    {
        id: "VID003",
        title: "Je me gode le cul",
        type: "video",
        price: 2,
        stock: 3
    },
    {
        id: "VID004",
        title: "Je me branle avec ma tête flouttée",
        type: "video",
        price: 20,
        stock: 1
    },
];

function getAllStocks() {
    return stockData;
}

function getStockById(id) {
    return stockData.find(item => item.id === id);
}

function getStocksByType(type) {
    return stockData.filter(item => item.type === type);
}

function calculateStats() {
    const totalItems = stockData.length;
    const totalVideos = stockData.filter(item => item.type === 'video').length;
    const totalPhotos = stockData.filter(item => item.type === 'photo').length;
    const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);

    return {
        totalItems,
        totalVideos,
        totalPhotos,
        totalStock
    };
}