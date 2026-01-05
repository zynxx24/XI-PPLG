// Load data from data.json
let JADWAL_DATA = {};
let GURU_DATA = [];

// Fetch JSON data
async function loadData() {
    try {
        const [jadwalResponse, guruResponse] = await Promise.all([
            fetch('./JSON/jadwal-pelajaran.JSON'),
            fetch('./JSON/daftar-guru.JSON')
        ]);

        const jadwalData = await jadwalResponse.json();
        const guruData = await guruResponse.json();

        JADWAL_DATA = jadwalData;
        GURU_DATA = guruData;

        renderJadwal();
        renderGuru();
        initInteractions();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

loadData();


function renderJadwal() {
    const tbody = document.getElementById('scheduleTableBody');
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
        console.log(schedule);

        if (!schedule) {
            console.error(`Data untuk hari ${day} tidak ditemukan`);
            return;
        }

        const row = document.createElement('tr');
        row.className = 'border-b border-slate-700';

        // Kolom Hari
        const dayCell = document.createElement('td');
        dayCell.className = 'px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center';
        dayCell.textContent = dayNames[day];
        row.appendChild(dayCell);

        // Generate kolom jadwal (10 jam pelajaran)
        schedule.forEach(mapel => {
            const cell = document.createElement('td');

            if (mapel.mapel === 'KOSONG') {
                cell.className = 'px-4 py-3 bg-slate-800';
                cell.colSpan = mapel.jam;
            } else {
                const mapelKey = mapel.mapel.toLowerCase().replace(/\./g, '').replace(/ /g, '-');
                const textColor = ['KIK'].includes(mapel.mapel) ? 'text-slate-800' : 'text-white';
                const smallColor = ['KIK'].includes(mapel.mapel) ? 'text-yellow-800' :
                    mapel.mapel.includes("Rekayasa Perangkat Lunak") ? 'text-blue-100' :
                        mapel.mapel === 'Pendidikan Pancasila' ? 'text-red-100' :
                            mapel.mapel === 'Bahasa Indonesia' ? 'text-green-100' :
                                mapel.mapel === 'Sejarah' ? 'text-purple-100' :
                                    mapel.mapel === 'Bahasa Bali' ? 'text-indigo-100' :
                                        mapel.mapel === 'Pendidikan Agama dan Budi Pekerti' ? 'text-orange-100' :
                                            mapel.mapel === 'Pendidikan Jasmani dan Olahraga' ? 'text-pink-100' :
                                                mapel.mapel === 'Bahasa Inggris' ? 'text-cyan-100' :
                                                    mapel.mapel === 'Matematika' ? 'text-green-100' : 'text-blue-100';

                cell.className = `px-2 py-3 subject-${mapelKey} ${textColor} text-center font-semibold`;
                cell.colSpan = mapel.jam;
                cell.innerHTML = `
                    <div>${mapel.mapel}</div>
                    <small class="${smallColor}">${mapel.guru}</small>
                `;
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function renderGuru() {
    const container = document.getElementById('teacherList');

    GURU_DATA.forEach(guru => {
        const card = document.createElement('div');
        card.className = `glass-effect rounded-2xl p-6 border-l-4 border-${guru.color} hover:scale-105 transition-transform duration-300`;

        card.innerHTML = `
            <div class="flex items-center mb-3">
                <div class="w-3 h-3 bg-${guru.color} rounded-full mr-3 animate-pulse"></div>
                <h3 class="text-lg font-bold text-${guru.color}">${guru.kode}</h3>
            </div>
            <p class="text-slate-300 text-sm mb-2">${guru.nama}</p>
            <p class="text-${guru.color}-200 font-semibold">👨‍🏫 ${guru.guru}</p>
            <p class="text-xs text-slate-400 mt-2">📱 ${guru.telp}</p>
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
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Add hover effects to table rows
    setTimeout(() => {
        document.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'scale(1.02)';
                row.style.transition = 'transform 0.2s ease';
            });

            row.addEventListener('mouseleave', () => {
                row.style.transform = 'scale(1)';
            });
        });

        // Add click effect to subject cells
        document.querySelectorAll('[class*="subject-"]').forEach(cell => {
            cell.addEventListener('click', () => {
                cell.style.transform = 'scale(1.1)';
                cell.style.transition = 'transform 0.1s ease';
                setTimeout(() => {
                    cell.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }, 100);
}

document.addEventListener('DOMContentLoaded', function () {
    // Load data akan otomatis render
});