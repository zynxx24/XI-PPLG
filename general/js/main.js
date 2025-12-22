// Fungsi untuk fetch data dari Google Sheets
async function fetchSheetData(sheetName) {
     try {

          const response = await fetch(GOOGLE_SHEETS_CONFIG.baseUrl);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

          // Cari sheet berdasarkan nama atau ambil sheet pertama sebagai fallback
          let targetSheet;
          if (workbook.Sheets[sheetName]) {
               targetSheet = workbook.Sheets[sheetName];
          } else {
               // Fallback: cari sheet berdasarkan index
               const sheetIndex = sheetName === 'lomba' ? 0 : 1;
               const sheetKey = workbook.SheetNames[sheetIndex];
               targetSheet = workbook.Sheets[sheetKey];
          }

          if (!targetSheet) {
               throw new Error(`Sheet '${sheetName}' not found in workbook`);
          }

          // Convert sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });

          if (jsonData.length < 2) {
               return [];
          }

          const headers = jsonData[0];
          const data = jsonData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                         obj[header] = row[index] || '';
                         });
                    return obj;
                    });

          // Filter hanya data yang aktif
          const activeData = data.filter(item => item.status === 'active');

          return activeData;

     } catch (error) {
               throw error;
          }
}

// Fungsi untuk format tanggal
function formatDate(dateStr) {
     try {
          if (!dateStr) return 'Tanggal tidak tersedia';
          const excelEpoch = new Date(1899, 11, 30);
          var date = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
          var date = date.toISOString().split("T")[0];
          return date;
     } catch {
               return dateStr;
          }
}

// Function to generate detailed content for reading page
function generateDetailedContent(item, type) {
     const isLomba = type === 'lomba';

     // Generate comprehensive content based on available data
     const sections = [];

     if (isLomba) {
          // Lomba-specific content
          sections.push({
               title: "🏆 Prestasi Gemilang",
               content: `Tim XI PPLG kembali menorehkan prestasi membanggakan dalam kompetisi ${item.judul || 'lomba'}. Dengan dedikasi tinggi dan kerja keras yang luar biasa, para siswa berhasil menunjukkan kemampuan terbaik mereka di hadapan peserta dari berbagai sekolah.`
          });

          sections.push({
               title: "📊 Statistik Kemenangan",
               content: `Berikut adalah pencapaian detail yang berhasil diraih dalam kompetisi ini:`,
               isStats: true,
               stats: [
                        { number: item.highlight_1_angka || '1st', label: item.highlight_1_label || 'Juara Umum' },
                        { number: item.highlight_2_angka || '100%', label: item.highlight_2_label || 'Tingkat Keberhasilan' },
                        { number: item.highlight_3_angka || '50+', label: item.highlight_3_label || 'Peserta Lain' }
                    ]
          });

          sections.push({
               title: "🌟 Dampak Prestasi",
               content: `Prestasi ini tidak hanya menjadi kebanggaan bagi XI PPLG, tetapi juga membuktikan kualitas pendidikan dan pembinaan yang diberikan kepada siswa. Dengan pencapaian ini, diharapkan dapat memotivasi siswa lainnya untuk terus berprestasi dan mengharumkan nama sekolah.`
          });

          sections.push({
               title: "🚀 Langkah Selanjutnya",
               content: `Tim akan melanjutkan persiapan untuk kompetisi-kompetisi selanjutnya dengan target pencapaian yang lebih tinggi. Dukungan dari seluruh civitas akademika XI PPLG akan terus diberikan untuk memastikan prestasi yang berkelanjutan.`
          });

     } else {
          // News-specific content
          sections.push({
               title: "📰 Berita Utama",
               content: item.deskripsi || `Dalam perkembangan terbaru di XI PPLG, ${item.judul} menjadi sorotan utama yang menarik perhatian seluruh komunitas sekolah. Peristiwa ini menandai milestone penting dalam perjalanan pendidikan di institusi kami.`
          });

          sections.push({
               title: "🔍 Analisis Mendalam",
               content: `Berdasarkan observasi dan data yang terkumpul, kejadian ini memiliki dampak signifikan terhadap dinamika kehidupan sekolah. Para stakeholder terkait telah memberikan respon positif dan dukungan penuh untuk kelanjutan program ini.`
          });

          sections.push({
               title: "💡 Insight & Pembelajaran",
               content: `Dari peristiwa ini, kita dapat mengambil beberapa pembelajaran berharga yang akan menjadi bekal untuk pengembangan program-program selanjutnya. Kolaborasi antar tim dan dukungan komunitas terbukti menjadi kunci kesuksesan.`
          });

          sections.push({
               title: "📈 Proyeksi ke Depan",
               content: `Dengan momentum positif yang tercipta, diharapkan inisiatif serupa dapat terus dikembangkan dan diimplementasikan. Tim akan terus melakukan evaluasi dan perbaikan untuk memastikan kualitas dan keberlanjutan program.`
          });
     }

     return sections;
}

// Function to open reading page
function openReading(itemId, type) {
     const data = type === 'lomba' ? globalLombaData : globalNewsData;
     const item = data.find(d => d.id === itemId) || data[0]; // Fallback to first item

     if (!item) {
          return;
     }

     const sections = generateDetailedContent(item, type);
     const isLomba = type === 'lomba';

     const articleHTML = `
          <div class="article-header card-hover">
               <h1 class="article-title">
                    ${item.emoji || item.emoji_utama || '📰'} ${item.judul || 'Judul Tidak Tersedia'}
               </h1>
                         
               <div class="article-meta">
                    <div class="meta-item">
                         <span>📅</span>
                         <span>${formatDate(item.tanggal)}</span>
                    </div>
                    <div class="meta-item">
                    <span>👤</span>
                         <span>${item.reporter || item.tim || 'Tim XI PPLG'}</span>
                    </div>
                    <div class="meta-item">
                         <span>📍</span>
                         <span>${item.lokasi || 'XI PPLG'}</span>
                    </div>
                    <div class="meta-item">
                         <span>⏱️</span>
                         <span>${item.estimasi_baca || '5 menit baca'}</span>
                    </div>
               </div>
          </div>
                
          <div class="article-content card-hover">
          ${sections.map(section => {

               if (section.isStats) {

                    return `

                         <div class="content-section">
                              <h3>${section.title}</h3>
                              <p>${section.content}</p>
                              <div class="stats-grid">
                                   ${section.stats.map(stat => `
                                        <div class="stat-card">
                                             <span class="stat-number">${stat.number}</span>
                                             <span class="stat-label">${stat.label}</span>
                                        </div>
                                   `).join('')}
                              </div>
                         </div>

                    `;

               } else {

                    return `
                         <div class="content-section">
                              <h3>${section.title}</h3>
                              <p>${section.content}</p>
                         </div>
                    `;
               }

          }).join('')}
                    
               ${isLomba ? 
               `
                    <div class="highlight-box card-hover">
                         <h3>🎉 Kutipan Istimewa</h3>
                            <p style="font-style: italic; font-size: 1.2rem; text-align: center; color: var(--neon-green);">
                                "Prestasi ini adalah bukti nyata dari dedikasi dan kerja keras seluruh tim. 
                                Kami bangga dapat mengharumkan nama XI PPLG di tingkat yang lebih luas."
                            </p>
                            <p style="text-align: center; margin-top: 1rem; color: #94a3b8;">
                                - ${item.reporter || 'Pembina Tim XI PPLG'}
                            </p>
                    </div>
                    ` : ''}
                    </div>
                
                    <div class="related-articles">
                         <h3 style="color: var(--electric-blue); font-size: 1.5rem; margin-bottom: 1rem;">
                         📚 Artikel Terkait
                         </h3>
                         <div class="related-grid" id="related-articles-grid">
                         <!-- Will be populated by JavaScript -->
                    </div>
                    </div>
               `;

     document.getElementById('article-content').innerHTML = articleHTML;

     // Populate related articles
     populateRelatedArticles(item, type);

     // Show reading page
     document.getElementById('berita').style.display = 'none';
     document.getElementById('reading-page').classList.remove('hidden');

     // Scroll to top
     window.scrollTo(0, 0);
}

// Function to populate related articles
function populateRelatedArticles(currentItem, currentType) {
     const relatedContainer = document.getElementById('related-articles-grid');

     // Get other articles (mix of lomba and news, excluding current)
     const allArticles = [...globalLombaData, ...globalNewsData]
          .filter(item => item.id !== currentItem.id)
          .slice(0, 3);

     relatedContainer.innerHTML = allArticles.map(article => {
          const articleType = globalLombaData.includes(article) ? 'lomba' : 'news';
          return `
                    <div class="related-card card-hover" onclick="openReading('${article.id}', '${articleType}')">
                        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                            <span style="background: ${articleType === 'lomba' ? 'linear-gradient(135deg, #ff006e, #ff7b00)' : 'linear-gradient(135deg, #00d4ff, #8b5cf6)'}; color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.75rem; font-weight: bold;">
                                ${articleType === 'lomba' ? '🏆 LOMBA' : '📰 NEWS'}
                            </span>
                        </div>
                        <h4 style="color: white; font-weight: bold; margin-bottom: 0.5rem;">
                            ${article.emoji || article.emoji_utama || '📝'} ${article.judul || 'Artikel Menarik'}
                        </h4>
                        <p style="color: #94a3b8; font-size: 0.9rem;">
                            ${(article.deskripsi || 'Baca artikel menarik lainnya dari XI PPLG').substring(0, 100)}...
                        </p>
                        <div style="margin-top: 1rem; color: var(--electric-blue); font-size: 0.8rem;">
                            📅 ${formatDate(article.tanggal)} • ⏱️ ${article.estimasi_baca || '5 menit baca'}
                        </div>
                    </div>
                `;
          }
     ).join('');
}

// Function to close reading page
function closeReading() {
     document.getElementById('reading-page').classList.add('hidden');
     document.getElementById('berita').style.display = 'block';
     window.scrollTo(0, 0);
}

// Modified render functions to include unique IDs and reading links
function renderLombaSection(lombaData) {
     const lombaContainer = document.getElementById('lomba-section');

     if (!lombaData || lombaData.length === 0) {
          lombaContainer.innerHTML = '';
          return;
     }

     const lomba = lombaData[0]; // Ambil data lomba terbaru
     lomba.id = lomba.id || 'lomba-' + Date.now(); // Ensure ID exists

     lombaContainer.innerHTML = 
          `
               <div class="bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl overflow-hidden news-modern card-hover group">
                    <div class="p-8">
                         <div class="flex items-center mb-6">
                              <span class="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-black mr-4 animate-pulse">
                                   🔥 BREAKING NEWS
                              </span>
                              <span class="text-pink-100 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">${formatDate(lomba.tanggal)}</span>
                         </div>
                         
                         <h3 class="text-4xl md:text-5xl font-black text-white mb-6 group-hover:text-yellow-200 transition-colors">
                              ${lomba.emoji || '🏆'} ${lomba.judul || 'Judul tidak tersedia'}
                         </h3>
                         
                         <p class="text-xl text-pink-50 leading-relaxed mb-6">
                              ${lomba.deskripsi || 'Deskripsi tidak tersedia'}
                         </p>
                         
                         <div class="bg-white bg-opacity-20 rounded-2xl p-6 mb-6">
                              <h4 class="text-lg font-bold text-white mb-3">💫 Highlight Kemenangan:</h4>
                              <div class="grid md:grid-cols-3 gap-4 text-center">
                                   <div>
                                        <div class="text-2xl font-bold text-yellow-300">${lomba.highlight_1_angka || '0'}</div>
                                        <div class="text-pink-100 text-sm">${lomba.highlight_1_label || 'Label 1'}</div>
                                   </div>
                                   <div>
                                        <div class="text-2xl font-bold text-yellow-300">${lomba.highlight_2_angka || '0'}</div>
                                        <div class="text-pink-100 text-sm">${lomba.highlight_2_label || 'Label 2'}</div>
                                   </div>
                                   <div>
                                        <div class="text-2xl font-bold text-yellow-300">${lomba.highlight_3_angka || '0'}</div>
                                        <div class="text-pink-100 text-sm">${lomba.highlight_3_label || 'Label 3'}</div>
                                   </div>
                              </div>
                         </div>
                         
                         <div class="flex items-center justify-between">
                              <div class="flex items-center">
                                   <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                                        <span class="text-red-600 font-black text-lg">📝</span>
                                   </div>
                                   <div>
                                        <div class="text-white font-bold">${lomba.reporter || 'Reporter'}</div>
                                        <div class="text-pink-200 text-sm">${lomba.lokasi || 'Lokasi'}</div>
                                   </div>
                              </div>
                              <button onclick="openReading('${lomba.id}', 'lomba')" class="bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105">
                                   Baca Selengkapnya 🚀
                              </button>
                         </div>
                    </div>
               </div>
          `;
}

// Fungsi untuk render news grid
function renderNewsGrid(newsData) {
    const gridContainer = document.getElementById('news-grid');
    const gridNews = newsData.filter(news => news.layout_type === 'grid').slice(0, 3);

    if (gridNews.length === 0) {
        gridContainer.innerHTML = '<div class="col-span-3 text-center text-gray-400">Tidak ada berita grid tersedia</div>';
        return;
    }

    gridContainer.innerHTML = gridNews.map(news => {
        news.id = news.id || 'news-' + Date.now() + Math.random(); // Ensure unique ID
        return `
                    <article class="news-modern rounded-2xl overflow-hidden card-hover group cursor-pointer" onclick="openReading('${news.id}', 'news')">
                        <div class="p-6">
                            <div class="flex items-center mb-4">
                                <span class="bg-gradient-to-r ${news.kategori_warna || 'from-blue-500 to-cyan-500'} text-white px-3 py-1 rounded-full text-xs font-bold mr-3">
                                    ${news.kategori_emoji || '📰'} ${news.kategori || 'NEWS'}
                                </span>
                                <span class="text-gray-400 text-sm">${formatDate(news.tanggal)}</span>
                            </div>
                            
                            <h4 class="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                ${news.emoji_utama || '📝'} ${news.judul || 'Judul tidak tersedia'}
                            </h4>
                            
                            <p class="text-gray-400 text-sm mb-4 leading-relaxed">
                                ${news.deskripsi || 'Deskripsi tidak tersedia'}
                            </p>
                            
                            <div class="flex justify-between items-center">
                                <div class="flex items-center space-x-2">
                                    <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span class="text-blue-400 text-sm font-semibold">${news.tim || 'Tim'}</span>
                                </div>
                                <div class="flex items-center space-x-2 text-gray-500 text-xs">
                                    <span>⏱️</span>
                                    <span>${news.estimasi_baca || '5 menit baca'}</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-gray-600">
                                <button class="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                                    Baca Selengkapnya →
                                </button>
                            </div>
                        </div>
                    </article>
                `;
        }
    ).join('');
}

// Fungsi untuk render additional news
function renderAdditionalNews(newsData) {
    const additionalContainer = document.getElementById('additional-news');
    const additionalNews = newsData.filter(news => news.layout_type === 'additional').slice(0, 2);

    if (additionalNews.length === 0) {
        additionalContainer.innerHTML = '<div class="col-span-2 text-center text-gray-400">Tidak ada berita additional tersedia</div>';
        return;
    }

    additionalContainer.innerHTML = additionalNews.map(news => {
        news.id = news.id || 'news-add-' + Date.now() + Math.random(); // Ensure unique ID
        return `
                    <article class="glassmorphism rounded-2xl p-6 card-hover group cursor-pointer" onclick="openReading('${news.id}', 'news')">
                        <div class="flex items-start space-x-4">
                            <div class="w-16 h-16 bg-gradient-to-r ${news.icon_bg_gradient || 'from-yellow-400 to-orange-500'} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:animate-wiggle">
                                <span class="text-white text-2xl">${news.icon_emoji || '📰'}</span>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center mb-2">
                                    <span class="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold mr-2">${news.kategori || 'NEWS'}</span>
                                    <span class="text-gray-400 text-xs">${formatDate(news.tanggal)}</span>
                                </div>
                                <h4 class="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                    ${news.judul || 'Judul tidak tersedia'}
                                </h4>
                                <p class="text-gray-300 text-sm mb-3">
                                    ${news.deskripsi || 'Deskripsi tidak tersedia'}
                                </p>
                                <button class="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors">
                                    Baca Artikel →
                                </button>
                            </div>
                        </div>
                    </article>
                `;
        }
    ).join('');
}

// Fungsi utama untuk load semua data
async function loadNews() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const newsContent = document.getElementById('news-content');

    // Show loading
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    newsContent.classList.add('hidden');

    try {
        // Fetch data parallel
        const [
            lombaData,
             newsData
            ] = await Promise.all(
                    [
                        fetchSheetData('lomba'),
                        fetchSheetData('news')
                    ]
                );

        // Store data globally for reading page
        globalLombaData = lombaData;
        globalNewsData = newsData;

        // Add unique IDs if not present
        globalLombaData.forEach((item, index) => {
            if (!item.id) item.id = 'lomba-' + index + '-' + Date.now();
        });

        globalNewsData.forEach((item, index) => {
            if (!item.id) item.id = 'news-' + index + '-' + Date.now();
        });

        // Sort news by date (newest first)
        if (newsData.length > 0) {
            newsData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            }

        // Render semua section
        renderLombaSection(lombaData);
        renderNewsGrid(newsData);
        renderAdditionalNews(newsData);

        // Show content
        loadingState.classList.add('hidden');
        newsContent.classList.remove('hidden');


        } catch (error) {
            // Show error state
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
        }
}

// Test function untuk debugging
async function testFetch() {
    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.baseUrl);

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        }
    } catch (error) {
            console.error("Error fetching data:", error);
    }
}

function updateAnimations() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax for floating shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.3;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });

    ticking = false;
}

// Random emoji animations
function createFloatingEmoji() {
    const emojis = ['💻', '🚀', '⭐', '💡', '🎯', '🔥', '⚡', '🌟'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const span = document.createElement('span');
    span.textContent = emoji;
    span.className = 'fixed pointer-events-none z-50 text-2xl opacity-70';
        span.style.left = Math.random() * window.innerWidth + 'px';
        span.style.top = window.innerHeight + 'px';

        document.body.appendChild(span);

        let pos = window.innerHeight;
        const animation = setInterval(() => {
            pos -= 2;
            span.style.top = pos + 'px';
            span.style.transform = `rotate(${pos * 0.5}deg)`;

            if (pos < -50) {
                clearInterval(animation);
                document.body.removeChild(span);
            }
        }, 
        50);
}

// Konfigurasi Google Sheets
const GOOGLE_SHEETS_CONFIG = {
     baseUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_Ama88gT05SLXGpLuFxoBlZ8xlq2qSWenRQJwWjWFTtE4_2NNcDLES9dJYeuBFSIjUUOo01VOdXan/pub?output=xlsx',
     lombaSheet: 'lomba',
     newsSheet: 'news'
};

// Global data
let globalNewsData = [];
let globalLombaData = [];
let ticking = false;

// Keyboard navigation for reading page
document.addEventListener('keydown', function (e) {
    const readingPage = document.getElementById('reading-page');
    if (!readingPage.classList.contains('hidden')) {
        if (e.key === 'Escape') {
             closeReading();
        }
    }
});

// Expose functions to global scope
window.testFetch = testFetch;
window.loadNews = loadNews;
window.openReading = openReading;
window.closeReading = closeReading;

// Mobile menu toggle with animation
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenuBtn.style.transform = mobileMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
});

// Enhanced smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.style.transform = 'rotate(0deg)';
        }
    });
});

// Scroll event listener for parallax and animations
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
});

// Interactive card effects
document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-12px) scale(1.03) rotate(1deg)';
        this.style.boxShadow = '0 25px 50px -12px rgba(0, 212, 255, 0.3)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        this.style.boxShadow = 'none';
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Add staggered animation to children
            const children = entry.target.querySelectorAll('.card-hover');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('section').forEach(section => {
    if (section.id !== 'home') {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    }
});

// Active navigation with smooth color transitions
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const span = link.querySelector('span');
        if (link.getAttribute('href') === `#${current}`) {
            span.style.transform = 'scale(1.1)';
            span.style.textShadow = '0 0 10px currentColor';
        } else {
            span.style.transform = 'scale(1)';
            span.style.textShadow = 'none';
        }
    });
});

// Easter egg: Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }

    if (konamiCode.toString() === konami.toString()) {
        // Secret animation
        document.body.style.animation = 'rainbow 2s ease-in-out';
        setTimeout(() => {
            alert('🎉 Selamat! Kamu menemukan easter egg XI PPLG! Kamu layak jadi programmer sejati! 🚀');
            document.body.style.animation = '';
        }, 1000);
        konamiCode = [];
    }
});

// Auto refresh setiap 5 menit
setInterval(loadNews, 5 * 60 * 1000);

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

// Create floating emojis periodically
setInterval(createFloatingEmoji, 3000);

// Dynamic color changing for neon effects
setInterval(() => {
    const neonElements = document.querySelectorAll('.animate-pulse-glow');
    neonElements.forEach(el => {
        const colors = ['electric-blue', 'cyber-purple', 'neon-green', 'hot-pink', 'sunset-orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.boxShadow = `0 0 30px var(--${randomColor})`;
    });
}, 2000);