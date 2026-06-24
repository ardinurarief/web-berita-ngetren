// =========================================
// IMAGE OPTIMIZER HELPER (SOLUSI 2)
// =========================================
function getOptimizedImage(url) {
    if (!url || url.trim() === "") {
        return 'https://via.placeholder.com/800x450?text=No+Image';
    }
    // Menggunakan wsrv.nl untuk crop otomatis ke rasio 16:9
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&h=450&fit=cover&q=80`;
}

let allArticles = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 18;

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    setupSearch();
    setupHamburger();

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
});

function filterCategory(category) {
    if (category === 'all') {
        window.location.href = 'index.html';
    } else {
        const encodedCat = encodeURIComponent(category);
        window.location.href = `index.html?cat=${encodedCat}`;
    }
}

// Fungsi untuk menangani filter kategori dari URL
function checkUrlFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');

    if (category) {
        const decodedCategory = decodeURIComponent(category);
        const filteredArticles = allArticles.filter(article => 
            article.category === decodedCategory
        );

        const newsList = document.getElementById('article-grid');
        newsList.innerHTML = '';

        // Sembunyikan Hero Section saat filter aktif
        const hero = document.getElementById('hero-section');
        if (hero) hero.style.display = 'none';

        const titleEl = document.querySelector('.section-title h2');
        if (titleEl) titleEl.innerText = `Kategori: ${decodedCategory}`;

        if (filteredArticles.length > 0) {
            filteredArticles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'news-item';
                item.onclick = () => window.location.href = `/article?slug=${article.slug}`;
                
                // PERBAIKAN: Gunakan getOptimizedImage
                item.innerHTML = `
                    <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
                    <div class="news-info">
                        <span class="news-cat">${article.category}</span>
                        <h3>${article.title}</h3>
                    </div>
                `;
                newsList.appendChild(item);
            });
        } else {
            newsList.innerHTML = '<p class="no-result-message">Belum ada artikel di kategori ini.</p>';
        }

        const btn = document.getElementById('load-more-btn');
        if (btn) btn.style.display = 'none';
    }
}

async function loadArticles() {
    try {
        const response = await fetch('data/articles.json');
        if (!response.ok) throw new Error('Gagal memuat data');
        
        let rawArticles = await response.json();
        allArticles = rawArticles.reverse(); 

        displayedCount = 0;
        renderHero(allArticles[0]);
        updateSidebar(1, 5); 
        updateReadAlso(6, 4); 
        loadMoreArticles(); 
        checkUrlFilter(); 
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderHero(headline) {
    const heroSection = document.getElementById('hero-section');
    if (!headline || !heroSection) return;

    const imgUrl = getOptimizedImage(headline.image);

    heroSection.innerHTML = `
        <div class="hero-card" onclick="window.location.href='/article?slug=${headline.slug}'">
            <img src="${imgUrl}" alt="${headline.title}">
            <div class="hero-overlay">
                <span class="hero-category">${headline.category || 'Umum'}</span>
                <h1 class="hero-title">${headline.title}</h1>
            </div>
        </div>
    `;
}

function updateSidebar(startIndex, count) {
    const sidebarList = document.getElementById('sidebar-list');
    if (!sidebarList) return;

    const sidebarArticles = allArticles.slice(startIndex, startIndex + count);

    if (sidebarArticles.length > 0) {
        // PERBAIKAN: Gunakan getOptimizedImage
        sidebarList.innerHTML = sidebarArticles.map(article => `
            <div class="news-item"  onclick="window.location.href='/article?slug=${article.slug}'">
                <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
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

    const startIdx = 1 + displayedCount; 
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const nextBatch = allArticles.slice(startIdx, endIdx);

    if (nextBatch.length === 0) {
        if(loadMoreBtn) loadMoreBtn.classList.add('hidden');
        return;
    }

    nextBatch.forEach(article => {
        const item = document.createElement('div');
        item.className = 'news-item';
        item.onclick = () => window.location.href = `/article?slug=${article.slug}`;
        
        // PERBAIKAN: Gunakan getOptimizedImage
        item.innerHTML = `
            <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
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

    displayedCount += nextBatch.length;
    updateSidebar(1, 5); 
    
    const readAlsoStartIndex = 1 + displayedCount;
    updateReadAlso(readAlsoStartIndex, 4);

    if (1 + displayedCount >= allArticles.length) {
        if(loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
}

function updateReadAlso(startIndex, count) {
    const readAlsoList = document.getElementById('read-also-list');
    if(!readAlsoList) return;

    const alsoArticles = allArticles.slice(startIndex, startIndex + count);

    if (alsoArticles.length > 0) {
        // PERBAIKAN: Gunakan getOptimizedImage
        readAlsoList.innerHTML = alsoArticles.map(article => `
            <div class="news-item" onclick="window.location.href='/article?slug=${article.slug}'">
                <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
                <div class="news-info">
                    <h3>${article.title}</h3>
                </div>
            </div>
        `).join('');
    } else {
        readAlsoList.innerHTML = '<p class="no-result-message">Sudah tidak ada artikel lain.</p>';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const heroSection = document.getElementById('hero-section'); // Pastikan ID ini ada di HTML

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const newsList = document.getElementById('article-grid');
        const sidebar = document.querySelector('.sidebar-column'); // Sidebar juga bisa disembunyikan biar makin fokus

        // Jika input kosong, kembalikan tampilan normal
        if (keyword === '') {
            newsList.innerHTML = '';
            displayedCount = 0;

            const btn = document.getElementById('load-more-btn');
            if(btn) btn.classList.remove('hidden'); // Muncul lagi di posisi center yang sama
            
            loadMoreArticles();

            // MUNCULKAN KEMBALI HERO & SIDEBAR
            if (heroSection) heroSection.style.display = 'block';
            if (sidebar) sidebar.style.display = 'block';

            updateSidebar(1, 5);
            updateReadAlso(6, 4); 
            return;
        }

        // SEMBUNYIKAN HERO SECTION SAAT MENGETIK
        if (heroSection) heroSection.style.display = 'none';
        
        // Opsional: Sembunyikan sidebar juga agar user fokus 100% ke hasil tengah
        // if (sidebar) sidebar.style.display = 'none'; 

        // Filter artikel
        const filtered = allArticles.filter(a => 
            a.title.toLowerCase().includes(keyword) || 
            a.category.toLowerCase().includes(keyword)
        );

        if (filtered.length === 0) {
            newsList.innerHTML = `
                <div class="no-result-message">
                    <h3>Artikel Tidak Ditemukan</h3>
                    <p>Coba kata kunci lain.</p>
                </div>
            `;
        } else {
            newsList.innerHTML = filtered.map(article => `
                 <div class="news-item" onclick="window.location.href='/article?slug=${article.slug}'">
                    <img src="${getOptimizedImage(article.image)}" class="news-thumb">
                    <div class="news-info">
                        <span class="news-cat">${article.category}</span>
                        <h3>${article.title}</h3>
                    </div>
                </div>
            `).join('');
        }

        const btn = document.getElementById('load-more-btn');
        if(btn) btn.style.display = 'none';
    };

    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (searchInputMobile) searchInputMobile.addEventListener('input', handleSearch);
}


function setupHamburger() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSearchBar = document.getElementById('mobile-search-bar');

    if(hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            if(mobileSearchBar) mobileSearchBar.classList.remove('active');
        });
    }

    if(mobileSearchBtn && mobileSearchBar) {
        mobileSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileSearchBar.classList.toggle('active');
            if(mobileSearchBar.classList.contains('active')) {
                setTimeout(() => document.getElementById('search-input-mobile').focus(), 100);
            }
            if(navMenu) navMenu.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target) && 
            !mobileSearchBtn.contains(e.target) && !mobileSearchBar.contains(e.target)) {
            if(navMenu) navMenu.classList.remove('active');
            if(mobileSearchBar) mobileSearchBar.classList.remove('active');
        }
    });
}

// FIX BUG: TUTUP SEARCH MOBILE SAAT RESIZE KE DESKTOP
window.addEventListener('resize', () => {
    const mobileSearchBar = document.getElementById('mobile-search-bar');
    if (window.innerWidth > 768) {
        if (mobileSearchBar) mobileSearchBar.classList.remove('active');
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) navMenu.classList.remove('active');
    }
});
