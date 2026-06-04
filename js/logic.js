let allArticles = [];
let displayedCount = 0; 
const ITEMS_PER_PAGE = 10; 

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    setupSearch();
    setupHamburger();
    
    const loadMoreBtn = document.getElementById('load-more-btn');
    if(loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
});

function filterCategory(category) {
    if (category === 'all') {
        window.location.href = 'home.html';
    } else {
        // Encode URI agar spasi dan simbol '&' aman di URL
        const encodedCat = encodeURIComponent(category);
        window.location.href = `home.html?cat=${encodedCat}`;
    }
}

// Fungsi untuk menangani filter kategori dari URL
function checkUrlFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (category) {
        // Decode kembali agar cocok dengan data di JSON
        const decodedCategory = decodeURIComponent(category);
        
        const filteredArticles = allArticles.filter(article => 
            article.category === decodedCategory
        );
        
        const newsList = document.getElementById('article-grid');
        newsList.innerHTML = ''; 
        
        // Sembunyikan Hero & Sidebar saat filter aktif
        const hero = document.getElementById('hero-section');
        const sidebar = document.querySelector('.sidebar-column');
        if(hero) hero.style.display = 'none';
        if(sidebar) sidebar.style.display = 'none';

        // Ubah Judul Section
        const titleEl = document.querySelector('.section-title h2');
        if(titleEl) titleEl.innerText = `Kategori: ${decodedCategory}`;

        if (filteredArticles.length > 0) {
            filteredArticles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'news-item';
                item.onclick = () => window.location.href = `article.html?slug=${article.slug}`;
                item.innerHTML = `
                    <img src="${article.image}" alt="${article.title}" class="news-thumb">
                    <div class="news-info">
                        <span class="news-cat">${article.category}</span>
                        <h3>${article.title}</h3>
                    </div>
                `;
                newsList.appendChild(item);
            });
        } else {
            newsList.innerHTML = '<p style="padding:20px;">Belum ada artikel di kategori ini.</p>';
        }
        
        const btn = document.getElementById('load-more-btn');
        if(btn) btn.style.display = 'none';
    }
}

// Panggil fungsi ini setelah loadArticles selesai
async function loadArticles() {
    try {
        const response = await fetch('data/articles.json');
        if (!response.ok) throw new Error('Gagal memuat data');
        
        let rawArticles = await response.json();
        
        // PENTING: Balik urutan agar artikel TERBARU ada di index 0
        allArticles = rawArticles.reverse(); 

        displayedCount = 0;
        
        // 1. Render Hero (Ambil artikel PERTAMA dari daftar yang sudah dibalik = Artikel Terbaru)
        renderHero(allArticles[0]);
        
        // 2. Render Sidebar (Ambil 5 artikel setelah headline)
        updateSidebar(1, 5); 
        
        // 3. Render Batch Pertama News List
        loadMoreArticles(); 
        
        // Cek filter kategori jika ada
        checkUrlFilter(); 

    } catch (error) {
        console.error('Error:', error);
    }
}

function renderHero(headline) {
    const heroSection = document.getElementById('hero-section');
    if(!headline || !heroSection) return;
    
    // Cek apakah gambar ada, jika tidak pakai placeholder
    const imgUrl = headline.image && headline.image.length > 10 ? headline.image : 'https://via.placeholder.com/800x400?text=No+Image';

    heroSection.innerHTML = `
        <div class="hero-card" onclick="window.location.href='article.html?slug=${headline.slug}'">
            <img src="${imgUrl}" alt="${headline.title}">
            <div class="hero-overlay">
                <span class="hero-category">${headline.category || 'Umum'}</span>
                <h1 class="hero-title">${headline.title}</h1>
            </div>
        </div>
    `;
}

// Fungsi Update Sidebar Dinamis
function updateSidebar(startIndex, count) {
    const sidebarList = document.getElementById('sidebar-list');
    if(!sidebarList) return;

    // Ambil artikel untuk sidebar
    const sidebarArticles = allArticles.slice(startIndex, startIndex + count);

    if (sidebarArticles.length > 0) {
        sidebarList.innerHTML = sidebarArticles.map(article => `
            <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
                <img src="${article.image}" alt="${article.title}" class="news-thumb">
                <div class="news-info">
                    <h3>${article.title}</h3>
                </div>
            </div>
        `).join('');
    }
}

function loadMoreArticles() {
    const newsList = document.getElementById('article-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!newsList) return;

    // Hitung index awal (skip 1 untuk headline)
    const startIdx = 1 + displayedCount; 
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const nextBatch = allArticles.slice(startIdx, endIdx);

    if (nextBatch.length === 0) {
        if(loadMoreBtn) loadMoreBtn.style.display = 'none'; 
        return;
    }

    // Render artikel baru ke kolom kiri
    nextBatch.forEach(article => {
        const item = document.createElement('div');
        item.className = 'news-item';
        item.onclick = () => window.location.href = `article.html?slug=${article.slug}`;
        
        item.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="news-thumb">
            <div class="news-info">
                <span class="news-cat">${article.category}</span>
                <h3>${article.title}</h3>
                <div class="news-meta">
                    <span>${new Date(article.date).toLocaleDateString('id-ID')}</span>
                </div>
            </div>
        `;
        newsList.appendChild(item);
    });

    // Update counter
    displayedCount += nextBatch.length;

    // UPDATE SIDEBAR JUGA SETIAP KALI LOAD MORE!
    // Kita ambil 5 artikel berikutnya setelah batch yang baru saja ditampilkan
    updateSidebar(1 + displayedCount, 5);

    // Cek apakah masih ada sisa artikel
    if (1 + displayedCount >= allArticles.length) {
        if(loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
}

// ... (Fungsi setupSearch dan setupHamburger tetap sama seperti sebelumnya) ...
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    
    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const newsList = document.getElementById('article-grid');
        
        if (keyword === '') { 
            newsList.innerHTML = '';
            displayedCount = 0;
            loadMoreArticles();
            // Reset sidebar ke default saat search dihapus
            updateSidebar(1, 5);
            return; 
        }

        const filtered = allArticles.filter(a => a.title.toLowerCase().includes(keyword) || a.category.toLowerCase().includes(keyword));
        
        newsList.innerHTML = filtered.map(article => `
             <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
                <img src="${article.image}" class="news-thumb">
                <div class="news-info"><h3>${article.title}</h3></div>
            </div>
        `).join('');
        
        const btn = document.getElementById('load-more-btn');
        if(btn) btn.style.display = 'none';
    };

    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (searchInputMobile) searchInputMobile.addEventListener('input', handleSearch);
}

function setupHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    if(btn && menu) btn.addEventListener('click', () => menu.classList.toggle('active'));
}
