// Load data from data.json
let JADWAL_DATA = {};
let GURU_DATA = [];

// Configuration for Subject Styling
const SUBJECT_CONFIG = {
    "Rekayasa Perangkat Lunak": { gpu: "rpl", text: "text-blue-100", small: "text-blue-200" },
    "Pendidikan Pancasila": { gpu: "pp", text: "text-red-100", small: "text-red-200" },
    "Pendalaman RPL": { gpu: "pdlrpl", text: "text-blue-50", small: "text-blue-200" },
    "Bahasa Indonesia": { gpu: "bindo", text: "text-green-100", small: "text-green-200" },
    "Bahasa Inggris": { gpu: "bing", text: "text-cyan-100", small: "text-cyan-200" },
    "Bahasa Bali": { gpu: "bb", text: "text-indigo-100", small: "text-indigo-200" },
    "Agama": { gpu: "pabp", text: "text-orange-100", small: "text-orange-200" }, // Mapped from JSON "Agama" to CSS "pabp"
    "Pendidikan Agama dan Budi Pekerti": { gpu: "pabp", text: "text-orange-100", small: "text-orange-200" },
    "Olahraga": { gpu: "pjok", text: "text-pink-100", small: "text-pink-200" }, // Mapped from JSON "Olahraga" to CSS "pjok"
    "Pendidikan Jasmani dan Olahraga": { gpu: "pjok", text: "text-pink-100", small: "text-pink-200" },
    "KIK": { gpu: "kik", text: "text-yellow-100", small: "text-yellow-200" },
    "Matematika": { gpu: "mat", text: "text-lime-100", small: "text-lime-200" },
    "Sejarah": { gpu: "sjr", text: "text-purple-100", small: "text-purple-200" },
    "Projek dan Wali": { gpu: "rpl", text: "text-slate-100", small: "text-slate-300" }, // Fallback to RPL style or generic
    "KOSONG": { gpu: "kosong", text: "text-slate-400", small: "" }
};

// Fetch JSON data
async function loadData() {
    try {
        const [jadwalResponse, guruResponse] = await Promise.all([
            fetch('./JSON/jadwal-pelajaran.JSON'),
            fetch('./JSON/daftar-guru.JSON')
        ]);

        if (!jadwalResponse.ok || !guruResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const jadwalData = await jadwalResponse.json();
        const guruData = await guruResponse.json();

        JADWAL_DATA = jadwalData;
        GURU_DATA = guruData;

        renderJadwal();
        renderGuru();
        initInteractions();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('scheduleTableBody').innerHTML = `
            <tr><td colspan="11" class="text-center py-8 text-red-400">
                Gagal memuat data jadwal. Silakan coba muat ulang halaman.
            </td></tr>
        `;
    }
}

function renderJadwal() {
    const tbody = document.getElementById('scheduleTableBody');
    if (!tbody) return;

    tbody.innerHTML = ''; // Clear existing content

    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
    const dayNames = {
        senin: 'SENIN',
        selasa: 'SELASA',
        rabu: 'RABU',
        kamis: 'KAMIS',
        jumat: 'JUMAT'
    };

    days.forEach(day => {
        const schedule = JADWAL_DATA[day];

        if (!schedule) {
            console.warn(`Data untuk hari ${day} tidak ditemukan`);
            return;
        }

        const row = document.createElement('tr');
        row.className = 'border-b border-slate-700 hover:bg-slate-800/30 transition-colors duration-200';

        // Kolom Hari
        const dayCell = document.createElement('td');
        dayCell.className = 'px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center align-middle shadow-lg';
        dayCell.textContent = dayNames[day];
        row.appendChild(dayCell);

        // Generate kolom jadwal
        schedule.forEach(mapel => {
            const cell = document.createElement('td');

            // Default config if not found
            let config = SUBJECT_CONFIG[mapel.mapel] || {
                gpu: "kosong",
                text: "text-white",
                small: "text-gray-300"
            };

            // Handle special case for KOSONG
            if (mapel.mapel === 'KOSONG') {
                cell.className = 'px-4 py-3 bg-slate-800 text-center';
            } else {
                // Use default style if specific subject config is missing
                const subjectClass = config.gpu === "kosong" && mapel.mapel !== 'KOSONG'
                    ? 'bg-slate-700'
                    : `subject-${config.gpu}`;

                cell.className = `px-2 py-3 ${subjectClass} ${config.text} text-center font-semibold relative overflow-hidden group cursor-pointer`;

                // Add hover effect overlay
                const hoverOverlay = document.createElement('div');
                hoverOverlay.className = 'absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200';

                cell.innerHTML = `
                    <div class="relative z-10 text-xs md:text-sm leading-tight mb-1">${mapel.mapel}</div>
                    <small class="${config.small} text-[10px] md:text-xs relative z-10 block leading-tight opacity-90">${mapel.guru}</small>
                `;
                cell.appendChild(hoverOverlay);
            }

            cell.colSpan = mapel.jam;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function renderGuru() {
    const container = document.getElementById('teacherList');
    if (!container) return;

    container.innerHTML = '';

    GURU_DATA.forEach((guru, index) => {
        const card = document.createElement('div');
        // Add delay for staggered animation
        const delay = index * 100;

        // Extract base color name (e.g., "blue" from "blue-500")
        const baseColor = guru.color.split('-')[0];

        card.className = `glass-effect rounded-2xl p-6 border-l-4 border-${guru.color} hover:scale-105 transition-all duration-300 transform hover:shadow-xl hover:shadow-${guru.color}/20`;
        card.style.animationDelay = `${delay}ms`;

        card.innerHTML = `
            <div class="flex items-center mb-3">
                <div class="w-3 h-3 bg-${guru.color} rounded-full mr-3 animate-pulse"></div>
                <h3 class="text-lg font-bold text-${guru.color}">${guru.kode}</h3>
            </div>
            <p class="text-slate-300 text-sm mb-2 font-medium">${guru.nama}</p>
            <p class="text-${baseColor}-200 font-semibold text-xs flex items-center">
                <span class="mr-2">👨‍🏫</span> ${guru.guru}
            </p>
            <div class="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                <p class="text-[10px] text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">📱 ${guru.telp}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

function initInteractions() {
    // Scroll animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Add click effect to existing cells (delegation would be better but keeping simple)
    // We already added hover effects in renderJadwal via CSS classes
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});