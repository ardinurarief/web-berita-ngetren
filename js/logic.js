let allArticles = [];
let displayedCount = 0; 
const ITEMS_PER_PAGE = 6; 

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    setupSearch();
    setupHamburger();
    
    const loadMoreBtn = document.getElementById('load-more-btn');
    if(loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
});

// Fungsi untuk menangani filter kategori dari URL
function checkUrlFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (category) {
        // Jika ada parameter cat, filter artikel
        const filteredArticles = allArticles.filter(article => 
            article.category.toLowerCase() === category.toLowerCase()
        );
        
        // Render hasil filter ke grid utama
        const newsList = document.getElementById('article-grid');
        newsList.innerHTML = ''; // Kosongkan dulu
        
        if (filteredArticles.length > 0) {
            filteredArticles.forEach(article => {
                // Gunakan logika render item yang sama seperti loadMoreArticles
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
            
            // Sembunyikan Hero Section jika sedang filter kategori (opsional, biar fokus)
            document.getElementById('hero-section').style.display = 'none';
            document.querySelector('.sidebar-column').style.display = 'none'; // Sembunyikan sidebar juga
            
            // Ubah judul halaman
            document.querySelector('.section-title h2').innerText = `Kategori: ${category}`;
            
            // Sembunyikan tombol load more karena ini hasil filter
            const btn = document.getElementById('load-more-btn');
            if(btn) btn.style.display = 'none';

        } else {
            newsList.innerHTML = '<p>Tidak ada artikel di kategori ini.</p>';
        }
    }
}

// Panggil fungsi ini setelah loadArticles selesai
async function loadArticles() {
    try {
        const response = await fetch('data/articles.json');
        if (!response.ok) throw new Error('Gagal memuat data');
        allArticles = await response.json();
        
        displayedCount = 0;
        renderHero(allArticles[0]);
        updateSidebar(1, 5); 
        loadMoreArticles(); 
        
        // CEK APAKAH ADA FILTER KATEGORI DI URL
        checkUrlFilter(); 

    } catch (error) {
        console.error('Error:', error);
    }
}

function renderHero(headline) {
    const heroSection = document.getElementById('hero-section');
    if(!headline || !heroSection) return;
    
    heroSection.innerHTML = `
        <div class="hero-card" onclick="window.location.href='article.html?slug=${headline.slug}'">
            <img src="${headline.image}" alt="${headline.title}">
            <div class="hero-overlay">
                <span class="hero-category">${headline.category}</span>
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
