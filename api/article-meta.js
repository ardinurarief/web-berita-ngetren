import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { slug } = req.query;

  // Jika tidak ada slug, kembalikan ke home atau error
  if (!slug) {
    return res.status(404).send("Artikel tidak ditemukan");
  }

  try {
    // 1. Ambil data articles.json (Pastikan path ini benar sesuai struktur GitHub kamu)
    // Kita pakai fetch ke raw github agar lebih aman daripada path lokal
    const jsonUrl =
      "https://raw.githubusercontent.com/ardinurarief/web-berita-ngetren/main/data/articles.json";
    const response = await fetch(jsonUrl);
    const articles = await response.json();

    const article = articles.find((a) => a.slug === slug);

    if (!article) {
      return res.status(404).send("Artikel tidak ditemukan");
    }

    // 2. Baca file article.html dasar
    // Kita baca file HTML statis yang sudah kamu buat
    const htmlPath = path.join(process.cwd(), "article.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    // 3. SUNTIKKAN Meta Tags ke dalam HTML
    // Kita cari tag <title> dan meta og:image untuk diganti

    // Ganti Title
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${article.title} - Getren News</title>`,
    );

    // Ganti Description
    html = html.replace(
      /<meta name="description" content=".*?">/,
      `<meta name="description" content="${article.metadeskripsi || article.title}">`,
    );

    // Ganti OG Image (Gunakan link asli dari Sheets agar resolusi tinggi)
    html = html.replace(
      /<meta property="og:image" content=".*?">/,
      `<meta property="og:image" content="${article.image}">`,
    );

    // Ganti OG Title & Desc
    html = html.replace(
      /<meta property="og:title" content=".*?">/,
      `<meta property="og:title" content="${article.title}">`,
    );
    html = html.replace(
      /<meta property="og:description" content=".*?">/,
      `<meta property="og:description" content="${article.metadeskripsi || article.title}">`,
    );

    // 4. Kirim HTML yang sudah disuntik ke User/Bot
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
