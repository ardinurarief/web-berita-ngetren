function getOptimizedImage(url) {
  // Jika tidak ada gambar, kembalikan placeholder
  if (!url || url.trim() === "") {
    return "https://via.placeholder.com/800x450?text=No+Image";
  }

  // Gunakan wsrv.nl untuk memproses gambar
  // w=800: Lebar 800px (cukup untuk HD)
  // h=450: Tinggi 450px (Rasio 16:9 standar FB/WA)
  // fit=cover: Memotong gambar agar penuh tanpa gepeng
  // q=80: Kualitas 80% agar loading cepat tapi tetap tajam
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&h=450&fit=cover&q=80`;
}

let allArticles = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 20; // Saya ubah ke 6 agar lebih standar portal berita (bisa diganti 20 jika mau)

document.addEventListener("DOMContentLoaded", () => {
  loadArticles();
  setupSearch();
  setupHamburger();

  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreArticles);
  }
});

function filterCategory(category) {
  if (category === "all") {
    window.location.href = "home.html"; // Pastikan kembali ke home.html
  } else {
    const encodedCat = encodeURIComponent(category);
    window.location.href = `home.html?cat=${encodedCat}`;
  }
}

// Fungsi untuk menangani filter kategori dari URL
function checkUrlFilter() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("cat");

  if (category) {
    const decodedCategory = decodeURIComponent(category);
    const filteredArticles = allArticles.filter(
      (article) => article.category === decodedCategory,
    );

    const newsList = document.getElementById("article-grid");
    newsList.innerHTML = "";

    // Sembunyikan Hero & Sidebar saat filter aktif
    const hero = document.getElementById("hero-section");
    if (hero) hero.style.display = "none";

    const titleEl = document.querySelector(".section-title h2");
    if (titleEl) titleEl.innerText = `Kategori: ${decodedCategory}`;

    if (filteredArticles.length > 0) {
      filteredArticles.forEach((article) => {
        const item = document.createElement("div");
        item.className = "news-item";
        item.onclick = () =>
          (window.location.href = `article.html?slug=${article.slug}`);
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
      newsList.innerHTML =
        '<p style="padding:20px; font-weight: bold; opacity: 0.6;">Belum ada artikel di kategori ini.</p>';
    }

    const btn = document.getElementById("load-more-btn");
    if (btn) btn.style.display = "none";
  }

  item.innerHTML = `
    <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
    <div class="news-info">
        <span class="news-cat">${article.category}</span>
        <h3>${article.title}</h3>
    </div>
`;
}

async function loadArticles() {
  try {
    const response = await fetch("data/articles.json");
    if (!response.ok) throw new Error("Gagal memuat data");

    let rawArticles = await response.json();

    // PENTING: BALIK URUTAN AGAR ARTIKEL TERBARU (PALING BAWAH DI JSON) JADI PALING ATAS
    allArticles = rawArticles.reverse();

    displayedCount = 0;

    // 1. Render Hero (Artikel Index 0 = Terbaru)
    renderHero(allArticles[0]);

    // 2. Render Sidebar Terpopuler (Ambil index 1-5)
    updateSidebar(1, 5);

    // 3. Render Baca Juga (Ambil index 6-9 sebagai awalan)
    updateReadAlso(6, 4);

    // 4. Render Berita Utama Batch Pertama (Mulai index 1)
    loadMoreArticles();

    // 5. Cek Filter Kategori
    checkUrlFilter();
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderHero(headline) {
  const heroSection = document.getElementById("hero-section");
  if (!headline || !heroSection) return;

  // Gunakan gambar yang sudah dioptimasi
  const imgUrl = getOptimizedImage(headline.image);

  heroSection.innerHTML = `
        <div class="hero-card" onclick="window.location.href='article.html?slug=${headline.slug}'">
            <img src="${imgUrl}" alt="${headline.title}">
            <div class="hero-overlay">
                <span class="hero-category">${headline.category || "Umum"}</span>
                <h1 class="hero-title">${headline.title}</h1>
            </div>
        </div>
    `;
}

function updateSidebar(startIndex, count) {
  const sidebarList = document.getElementById("sidebar-list");
  if (!sidebarList) return;

  const sidebarArticles = allArticles.slice(startIndex, startIndex + count);

  if (sidebarArticles.length > 0) {
    sidebarList.innerHTML = sidebarArticles
      .map(
        (article) => `
            <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
                <img src="${article.image}" alt="${article.title}" class="news-thumb">
                <div class="news-info">
                    <h3>${article.title}</h3>
                </div>
            </div>
        `,
      )
      .join("");
  }

  sidebarList.innerHTML = sidebarArticles.map(article => `
    <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
        <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
        <div class="news-info">
            <h3>${article.title}</h3>
        </div>
    </div>
`).join('');
}

function loadMoreArticles() {
  const newsList = document.getElementById("article-grid");
  const loadMoreBtn = document.getElementById("load-more-btn");

  if (!newsList) return;

  // Hitung index awal (skip 1 karena index 0 sudah jadi Headline)
  const startIdx = 1 + displayedCount;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const nextBatch = allArticles.slice(startIdx, endIdx);

  if (nextBatch.length === 0) {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  // Render artikel baru ke kolom kiri
  nextBatch.forEach((article) => {
    const item = document.createElement("div");
    item.className = "news-item";
    item.onclick = () =>
      (window.location.href = `article.html?slug=${article.slug}`);

    item.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="news-thumb">
            <div class="news-info">
                <span class="news-cat">${article.category}</span>
                <h3>${article.title}</h3>
                <div class="news-meta">
                    <span>${new Date(article.date).toLocaleDateString("id-ID")}</span>
                </div>
            </div>
        `;
    newsList.appendChild(item);
  });

  // Update counter jumlah artikel yang sudah tampil di kolom kiri
  displayedCount += nextBatch.length;

  // UPDATE SIDEBAR DINAMIS
  // Terpopuler tetap ambil dari atas (index 1-5)
  updateSidebar(1, 5);

  // Baca Juga ambil dari artikel SETELAH batch terakhir yang ditampilkan
  // Rumus: 1 (headline) + displayedCount (yang sudah muncul di kiri)
  const readAlsoStartIndex = 1 + displayedCount;
  updateReadAlso(readAlsoStartIndex, 4);

  // Cek apakah masih ada sisa artikel
  if (1 + displayedCount >= allArticles.length) {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }

  item.innerHTML = `
    <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
    <div class="news-info">
        <span class="news-cat">${article.category}</span>
        <h3>${article.title}</h3>
        <div class="news-meta">
            <span>${new Date(article.date).toLocaleDateString("id-ID")}</span>
        </div>
    </div>
`;
}

function updateReadAlso(startIndex, count) {
  const readAlsoList = document.getElementById("read-also-list");
  if (!readAlsoList) return;

  // Ambil artikel dari posisi terakhir
  const alsoArticles = allArticles.slice(startIndex, startIndex + count);

  if (alsoArticles.length > 0) {
    readAlsoList.innerHTML = alsoArticles
      .map(
        (article) => `
            <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
                <img src="${article.image}" alt="${article.title}" class="news-thumb">
                <div class="news-info">
                    <h3>${article.title}</h3>
                </div>
            </div>
        `,
      )
      .join("");
  } else {
    readAlsoList.innerHTML =
      '<p style="font-size:0.8rem; color:#888; padding:10px;">Sudah tidak ada artikel lain.</p>';
  }

  sidebarList.innerHTML = sidebarArticles.map(article => `
    <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
        <img src="${getOptimizedImage(article.image)}" alt="${article.title}" class="news-thumb">
        <div class="news-info">
            <h3>${article.title}</h3>
        </div>
    </div>
`).join('');
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchInputMobile = document.getElementById("search-input-mobile");

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    const newsList = document.getElementById("article-grid");

    // Jika input kosong, reset tampilan ke awal
    if (keyword === "") {
      newsList.innerHTML = "";
      displayedCount = 0;
      loadMoreArticles();

      // Munculkan kembali sidebar & hero jika sebelumnya disembunyikan
      const hero = document.getElementById("hero-section");
      const sidebar = document.querySelector(".sidebar-column");
      if (hero) hero.style.display = "block";
      if (sidebar) sidebar.style.display = "block";

      updateSidebar(1, 5);
      updateReadAlso(6, 4);
      return;
    }

    // Filter artikel berdasarkan judul atau kategori
    const filtered = allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(keyword) ||
        a.category.toLowerCase().includes(keyword),
    );

    // VALIDASI: CEK APAKAH DATA DITEMUKAN
    if (filtered.length === 0) {
      newsList.innerHTML = `
                <div class="no-result-message">
                    <h3>Artikel Tidak Ditemukan</h3>
                </div>
            `;
    } else {
      // Jika ditemukan, render seperti biasa
      newsList.innerHTML = filtered
        .map(
          (article) => `
                 <div class="news-item" onclick="window.location.href='article.html?slug=${article.slug}'">
                    <img src="${article.image}" class="news-thumb">
                    <div class="news-info">
                        <span class="news-cat">${article.category}</span>
                        <h3>${article.title}</h3>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    // Sembunyikan tombol load more dan sidebar saat mencari
    const btn = document.getElementById("load-more-btn");
    if (btn) btn.style.display = "none";
  };

  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (searchInputMobile)
    searchInputMobile.addEventListener("input", handleSearch);
}

function setupHamburger() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const mobileSearchBar = document.getElementById("mobile-search-bar");

  // Toggle Hamburger Menu
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("active");

      // Opsional: Tutup search bar jika hamburger dibuka
      if (mobileSearchBar) mobileSearchBar.classList.remove("active");
    });
  }

  // Toggle Mobile Search Bar
  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileSearchBar.classList.toggle("active");

      // Fokus ke input saat dibuka
      if (mobileSearchBar.classList.contains("active")) {
        setTimeout(
          () => document.getElementById("search-input-mobile").focus(),
          100,
        );
      }

      // Opsional: Tutup menu hamburger jika search dibuka
      if (navMenu) navMenu.classList.remove("active");
    });
  }

  // Tutup semua jika klik di luar
  document.addEventListener("click", (e) => {
    if (
      !hamburgerBtn.contains(e.target) &&
      !navMenu.contains(e.target) &&
      !mobileSearchBtn.contains(e.target) &&
      !mobileSearchBar.contains(e.target)
    ) {
      if (navMenu) navMenu.classList.remove("active");
      if (mobileSearchBar) mobileSearchBar.classList.remove("active");
    }
  });
}
