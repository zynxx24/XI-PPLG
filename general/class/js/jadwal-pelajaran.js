const JADWAL_DATA = fetch('/XI-PPLG/general/class/JSON/jadwal-pelajaran.JSON')
     .then(response => response.json())
     .catch(error => console.error('Error loading schedule data:', error));

const GURU_DATA = fetch('/XI-PPLG/general/class/JSON/daftar-guru.JSON')
     .then(response => response.json())
     .catch(error => console.error('Error loading teacher data:', error));

function renderJadwal() {
     const tbody = document.getElementById('scheduleTableBody');
     const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
     const dayNames = {
          'senin': 'SENIN',
          'selasa': 'SELASA',
          'rabu': 'RABU',
          'kamis': 'KAMIS',
          'jumat': 'JUMAT'
     };

     days.forEach(day => {
          const schedule = JADWAL_DATA[day];
          const row = document.createElement('tr');
          row.className = 'border-b border-slate-700';

          // Kolom Hari
          const dayCell = document.createElement('td');
          dayCell.className = 'px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center';
          dayCell.textContent = dayNames[day];
          row.appendChild(dayCell);

          // Generate kolom jadwal (10 jam pelajaran)
          let currentJam = 1;
          schedule.forEach(mapel => {
               const cell = document.createElement('td');

               if (mapel.mapel === 'KOSONG') {
                    cell.className = 'px-4 py-3 bg-slate-800';
                    cell.colSpan = mapel.jam;
               } else {
                    const mapelKey = mapel.mapel.toLowerCase().replace(/\./g, '').replace(/ /g, '-');
                    const textColor = ['KIK'].includes(mapel.mapel) ? 'text-slate-800' : 'text-white';
                    const smallColor = ['KIK'].includes(mapel.mapel) ? 'text-yellow-800' :
                         mapel.mapel.includes('PPLG') ? 'text-blue-100' :
                              mapel.mapel === 'PP' ? 'text-red-100' :
                                   mapel.mapel === 'B.INDO' ? 'text-green-100' :
                                        mapel.mapel === 'SEJ' ? 'text-purple-100' :
                                             mapel.mapel === 'BB' ? 'text-indigo-100' :
                                                  mapel.mapel === 'PABP' ? 'text-orange-100' :
                                                       mapel.mapel === 'PJOK' ? 'text-pink-100' :
                                                            mapel.mapel === 'B.ING' ? 'text-cyan-100' :
                                                                 mapel.mapel === 'MAT' ? 'text-green-100' : 'text-blue-100';

                    cell.className = `px-2 py-3 subject-${mapelKey} ${textColor} text-center font-semibold`;
                    cell.colSpan = mapel.jam;
                    cell.innerHTML = `
                            <div>${mapel.mapel}</div>
                            <small class="${smallColor}">${mapel.guru}</small>
                        `;
               }

               row.appendChild(cell);
               currentJam += mapel.jam;
          });

          tbody.appendChild(row);
     });
}

// ============================================
// FUNGSI RENDER DAFTAR GURU
// ============================================
function renderGuru() {
     const container = document.getElementById('teacherList');

     GURU_DATA.forEach(guru => {
          const card = document.createElement('div');
          card.className = `glass-effect rounded-2xl p-6 border-l-4 border-${guru.color}-500 hover:scale-105 transition-transform duration-300`;

          card.innerHTML = `
                    <div class="flex items-center mb-3">
                        <div class="w-3 h-3 bg-${guru.color}-500 rounded-full mr-3 animate-pulse"></div>
                        <h3 class="text-lg font-bold text-${guru.color}-300">${guru.kode}</h3>
                    </div>
                    <p class="text-slate-300 text-sm mb-2">${guru.nama}</p>
                    <p class="text-${guru.color}-200 font-semibold">👨‍🏫 ${guru.guru}</p>
                    <p class="text-xs text-slate-400 mt-2">📱 ${guru.telp}</p>
                `;

          container.appendChild(card);
     });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function () {
     renderJadwal();
     renderGuru();

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
});