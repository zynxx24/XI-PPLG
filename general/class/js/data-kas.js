let connectedWallet = null;
let paymentData = [];
let kasChartData = [];
let dataKas = [];
let dendaData = [];
let pengeluarData = [];
let donaturData = [];

const FilePath = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_Ama88gT05SLXGpLuFxoBlZ8xlq2qSWenRQJwWjWFTtE4_2NNcDLES9dJYeuBFSIjUUOo01VOdXan/pub?output=xlsx';
const SheetDoc = 'history'; // Ensure this matches the sheet name in your Google Sheet
const SheetData = 'doc'; // Ensure this matches the sheet name in your Google Sheet
const DataKas = 'datakas'; // Ensure this matches the sheet name in your Google Sheet
const SheetDendaData = 'denda'; // Ensure this matches the sheet name in your Google Sheet
const SheetPengeluarData = 'pengeluaran'; // Ensure this matches the sheet name in your Google Sheet 
const SheetDonaturData = 'donatur'; // Ensure this matches the sheet name in your Google Sheet

async function loadSheetData() {
     try {
          const response = await fetch(FilePath);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

          // Load data from 'doc' sheet
          const docSheet = workbook.Sheets[SheetDoc];
          let loadedPaymentData = [];
          if (docSheet) {
               loadedPaymentData = XLSX.utils.sheet_to_json(docSheet);
          }

          // Load data from 'history' sheet
          const historySheet = workbook.Sheets[SheetData];
          let loadedKasChartData = [];
          if (historySheet) {
               loadedKasChartData = XLSX.utils.sheet_to_json(historySheet);
          }

          // Load data from 'datakas' sheet
          const dataKasSheet = workbook.Sheets[DataKas];
          let loadedDataKas = [];
          if (dataKasSheet) {
               loadedDataKas = XLSX.utils.sheet_to_json(dataKasSheet);
          }

          // Load data from 'pengeluaran' sheet
          const pengeluarDataSheet = workbook.Sheets[SheetPengeluarData];
          let LoadedPengeluarData = [];
          if (pengeluarDataSheet) {
               LoadedPengeluarData = XLSX.utils.sheet_to_json(pengeluarDataSheet);
          }

          // Load data from 'denda' sheet
          const dendaDataSheet = workbook.Sheets[SheetDendaData];
          let loadedDendaData = [];
          if (dendaDataSheet) {
               loadedDendaData = XLSX.utils.sheet_to_json(dendaDataSheet);
          }

          // Load data from 'donatur' sheet
          const donaturDataSheet = workbook.Sheets[SheetDonaturData];
          let loadedDonaturData = [];
          if (donaturDataSheet) {
               loadedDonaturData = XLSX.utils.sheet_to_json(donaturDataSheet);
          }

          // Return both datasets
          return {
               paymentData: loadedPaymentData,
               kasChartData: loadedKasChartData,
               dataKas: loadedDataKas,
               pengeluarData: LoadedPengeluarData,
               dendaData: loadedDendaData,
               donaturData: loadedDonaturData
          };
     } catch (error) {
          console.error("Error loading sheet data:", error);

          // Return mock data if sheet loading fails - using the actual data from your paste
          const mockDataKas = [
               {
                    Nama: 'Loading..',
                    Tanggal: true,
                    __EMPTY: true,
                    __EMPTY_1: false,
                    __EMPTY_2: false,
                    __EMPTY_3: false
               },
          ];

          return {
               paymentData: [
                    {
                         nama: "Loading...",
                         metode: "N/A",
                         from: "N/A",
                         jumlah: "$0",
                         tanggal: "N/A"
                    }
               ],
               kasChartData: [
                    {
                         date: "2024-01-01",
                         endValue: 0,
                         daily: 0
                    }
               ],
               dataKas: mockDataKas
          };
     }
}

function copyText(id) {
     const element = document.getElementById(id);
     if (!element) {
          showToast("Element not found");
          return;
     }

     const text = element.textContent;
     navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied: ${text.substring(0, 20)}...`);
     }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showToast(`Copied: ${text.substring(0, 20)}...`);
     });
}

function loadDataKasTable(data = dataKas) {
     const tbody = document.getElementById('datakas-tbody');
     if (!tbody) {
          console.error("datakas-tbody element not found");
          return;
     }

     tbody.innerHTML = '';

     if (!data || data.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = '<td colspan="10" class="py-4 text-center text-gray-400">No data kas available</td>';
          tbody.appendChild(row);
          return;
     }

     // Filter out rows that don't have a valid name
     const validData = data.filter(student => student.Nama && typeof student.Nama === 'string' && student.Nama.trim() !== '');

     validData.forEach((student, index) => {
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';

          // Create cells for name and each date column
          let cellsHTML = `<td class="py-3 px-4 font-medium text-white sticky left-0 bg-gray-800">${student.Nama || 'N/A'}</td>`;

          // Define the expected date columns based on your table headers
          const dateColumns = ['Tanggal', '__EMPTY', '__EMPTY_1', '__EMPTY_2', '__EMPTY_3', '__EMPTY_4', '__EMPTY_5', '__EMPTY_6', '__EMPTY_7'];

          dateColumns.forEach(dateKey => {
               const status = student[dateKey];
               let emoji = '❌'; // default

               // Check for various true values
               if (status === true || status === 'TRUE' || status === '1' || status === 1 || status === 'true') {
                    emoji = '✅';
               }

               cellsHTML += `<td class="py-3 px-2 text-center text-lg">${emoji}</td>`;
          });

          row.innerHTML = cellsHTML;
          tbody.appendChild(row);
     });
}

function generateQRCode(address, elementId, size = 100) {
     try {
          const element = document.getElementById(elementId);
          if (!element) {
               console.error(`Element with ID ${elementId} not found`);
               return;
          }

          new QRious({
               element: element,
               value: address,
               size: size,
               background: '#1f2937',
               foreground: '#ffffff',
               padding: 5
          });
     } catch (error) {
          console.error(`Failed to generate QR code for ${elementId}:`, error);
     }
}

function showToast(message) {
     const toast = document.createElement('div');
     toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50';
     toast.textContent = message;
     document.body.appendChild(toast);
     setTimeout(() => {
          toast.classList.add('animate-fade-out');
          setTimeout(() => {
               if (toast.parentNode) {
                    toast.remove();
               }
          }, 300);
     }, 3000);
}

// Fungsi untuk sort berdasarkan tanggal terbaru
function sortPaymentByDate(data) {
     if (!data || data.length === 0) return [];

     return [...data].sort((a, b) => {
          if (!a.tanggal && !b.tanggal) return 0;
          if (!a.tanggal) return 1;
          if (!b.tanggal) return -1;

          const dateA = parseFloat(a.tanggal);
          const dateB = parseFloat(b.tanggal);

          // Sort descending (terbaru di atas)
          return dateB - dateA;
     });
}

function sortPengeluaranByDate(data) {
     if (!data || data.length === 0) return [];

     return [...data].sort((a, b) => {
          if (!a.tanggal && !b.tanggal) return 0;
          if (!a.tanggal) return 1;
          if (!b.tanggal) return -1;

          const dateA = parseFloat(a.tanggal);
          const dateB = parseFloat(b.tanggal);

          // Sort descending (terbaru di atas)
          return dateB - dateA;
     });
}

function loadPaymentTable(data = paymentData, sortByDate = true) {
     // Sort data jika diperlukan
     const sortedData = sortByDate ? sortPaymentByDate(data) : data;

     const scrollContainer = document.querySelector('.overflow-x-auto');
     if (!scrollContainer) return;

     const tbody = document.getElementById('payment-tbody');
     if (!tbody) return;

     const ITEM_HEIGHT = 60;
     const VISIBLE_ITEMS = 10;
     const CONTAINER_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;

     scrollContainer.style.maxHeight = `${CONTAINER_HEIGHT}px`;
     scrollContainer.style.overflowY = 'auto';
     scrollContainer.style.position = 'relative';

     let startIndex = 0;
     let isScrolling = false;

     function renderVisibleItems() {
          if (!sortedData || sortedData.length === 0) {
               tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">No payment data available</td></tr>';
               return;
          }

          tbody.innerHTML = '';

          // Top spacer
          if (startIndex > 0) {
               const topSpacer = document.createElement('tr');
               topSpacer.style.height = `${startIndex * ITEM_HEIGHT}px`;
               topSpacer.innerHTML = '<td colspan="5"></td>';
               tbody.appendChild(topSpacer);
          }

          const endIndex = Math.min(startIndex + VISIBLE_ITEMS + 5, sortedData.length);

          for (let i = startIndex; i < endIndex; i++) {
               const payment = sortedData[i];
               const row = document.createElement('tr');
               row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';
               row.style.height = `${ITEM_HEIGHT}px`;

               const dateToJSDate = (date) => {
                    if (!date) return 'N/A';
                    const excelEpoch = new Date(1899, 11, 30);
                    const convertedDate = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
                    return convertedDate.toISOString().split("T")[0];
               }

               const formatCurrency = (amount) => {
                    if (!amount) return 'Rp 0';
                    return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
               }

               // Add indicator for latest entries (optional)
               const isRecent = i < 2;
               const nameClass = isRecent ? 'font-medium text-green-300' : 'font-medium';

               row.innerHTML = `
            <td class="py-3 px-4 ${nameClass}">
              ${isRecent ? '🆕 ' : ''}${payment.nama || 'N/A'}
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-1 bg-blue-600 rounded-full text-xs">${payment.metode || 'N/A'}</span>
            </td>
            <td class="py-3 px-4 font-mono text-xs" title="${payment.from || 'N/A'}">
              ${payment.from || 'N/A'}
            </td>
            <td class="py-3 px-4 text-green-400 font-semibold">${formatCurrency(payment.jumlah) || 'Rp. 0'}</td>
            <td class="py-3 px-4 text-gray-400 ${isRecent ? 'font-semibold' : ''}">
              ${dateToJSDate(payment.tanggal)}
            </td>
          `;
               tbody.appendChild(row);
          }

          // Bottom spacer
          const remainingItems = sortedData.length - endIndex;
          if (remainingItems > 0) {
               const bottomSpacer = document.createElement('tr');
               bottomSpacer.style.height = `${remainingItems * ITEM_HEIGHT}px`;
               bottomSpacer.innerHTML = '<td colspan="5"></td>';
               tbody.appendChild(bottomSpacer);
          }
     }

     function handleScroll() {
          if (isScrolling) return;

          isScrolling = true;
          requestAnimationFrame(() => {
               const scrollTop = scrollContainer.scrollTop;
               const newStartIndex = Math.floor(scrollTop / ITEM_HEIGHT);

               if (Math.abs(newStartIndex - startIndex) > 2) {
                    startIndex = Math.max(0, newStartIndex - 2);
                    renderVisibleItems();
               }

               isScrolling = false;
          });
     }

     scrollContainer.removeEventListener('scroll', handleScroll);
     scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

     renderVisibleItems();
}

function LoadedPengeluarData(data = pengeluarData, sortByDate = true) {
     const sortedData = sortByDate ? sortPengeluaranByDate(data) : data;
     const tbody = document.getElementById('loss-tbody');

     if (!tbody) {
          console.error('loss-tbody tidak ditemukan');
          return;
     }

     // Set scroll untuk parent container
     const scrollContainer = tbody.closest('.overflow-x-auto');
     if (scrollContainer) {
          scrollContainer.style.maxHeight = '600px';
          scrollContainer.style.overflowY = 'auto';
     }

     tbody.innerHTML = '';

     if (!sortedData || sortedData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">No pengeluaran data available</td></tr>';
          return;
     }

     sortedData.forEach((loss, index) => {
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';

          const dateToJSDate = (date) => {
               if (!date) return 'N/A';
               const excelEpoch = new Date(1899, 11, 30);
               const convertedDate = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
               return convertedDate.toISOString().split("T")[0];
          }

          const formatCurrency = (amount) => {
               if (!amount) return 'Rp 0';
               return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
          }

          const isRecent = index < 2;
          const nameClass = isRecent ? 'font-medium text-red-300' : 'font-medium';

          row.innerHTML = `
          <td class="py-3 px-4 ${nameClass}">
            ${isRecent ? '🆕 ' : ''}${loss.barang || 'N/A'}
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-1 bg-orange-600 rounded-full text-xs">${loss.jumlah || '0'}</span>
          </td>
          <td class="py-3 px-4 font-mono text-xs">
            ${formatCurrency(loss.harga_satuan)}
          </td>
          <td class="py-3 px-4 text-red-400 font-semibold">${formatCurrency(loss.harga_akhir)}</td>
          <td class="py-3 px-4 text-gray-400 ${isRecent ? 'font-semibold' : ''}">
            ${dateToJSDate(loss.tanggal)}
          </td>
        `;
          tbody.appendChild(row);
     });
}

function LoadedDenda(data = dendaData, sortByDate = true) {
     const sortedData = sortByDate ? sortPengeluaranByDate(data) : data;
     const tbody = document.getElementById('denda-tbody');

     if (!tbody) {
          console.error('denda-tbody tidak ditemukan');
          return;
     }

     // Set scroll untuk parent container
     const scrollContainer = tbody.closest('.overflow-x-auto');
     if (scrollContainer) {
          scrollContainer.style.maxHeight = '600px';
          scrollContainer.style.overflowY = 'auto';
     }

     tbody.innerHTML = '';

     if (!sortedData || sortedData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">No denda data available</td></tr>';
          return;
     }

     sortedData.forEach((denda, index) => {
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';

          const dateToJSDate = (date) => {
               if (!date) return 'N/A';
               const excelEpoch = new Date(1899, 11, 30);
               const convertedDate = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
               return convertedDate.toISOString().split("T")[0];
          }

          const formatCurrency = (amount) => {
               if (!amount) return 'Rp 0';
               return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
          }

          const isRecent = index < 2;
          const nameClass = isRecent ? 'font-medium text-red-300' : 'font-medium';

          row.innerHTML = `
          <td class="py-3 px-4 ${nameClass}">
            ${isRecent ? '🆕 ' : ''}${denda.nama || 'N/A'}
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-1 bg-orange-600 rounded-full text-xs">${denda.deskripsi || 'N/A'}</span>
          </td>
          <td class="py-3 px-4 font-mono text-xs"> ${formatCurrency(denda.nominal)}
          </td>
          <td class="py-3 px-4 text-gray-400 ${isRecent ? 'font-semibold' : ''}">
            ${dateToJSDate(denda.tanggal)}
          </td>
        `;
          tbody.appendChild(row);
     });
}

function LoadedDonatur(data = donaturData, sortByDate = true) {
     const sortedData = sortByDate ? sortPengeluaranByDate(data) : data;
     const tbody = document.getElementById('donatur-tbody');

     if (!tbody) {
          console.error('denda-tbody tidak ditemukan');
          return;
     }

     // Set scroll untuk parent container
     const scrollContainer = tbody.closest('.overflow-x-auto');
     if (scrollContainer) {
          scrollContainer.style.maxHeight = '600px';
          scrollContainer.style.overflowY = 'auto';
     }

     tbody.innerHTML = '';

     if (!sortedData || sortedData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">No Donatur data available</td></tr>';
          return;
     }

     sortedData.forEach((donatur, index) => {
          const row = document.createElement('tr');
          row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';

          const dateToJSDate = (date) => {
               if (!date) return 'N/A';
               const excelEpoch = new Date(1899, 11, 30);
               const convertedDate = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
               return convertedDate.toISOString().split("T")[0];
          }

          const formatCurrency = (amount) => {
               if (!amount) return 'Rp 0';
               return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
          }

          const isRecent = index < 2;
          const nameClass = isRecent ? 'font-medium text-green-300' : 'font-medium';

          row.innerHTML = `
          <td class="py-3 px-4 ${nameClass}">
            ${isRecent ? '🆕 ' : ''}${donatur.nama || 'N/A'}
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-1 bg-green-600 rounded-full text-xs">${donatur.deskripsi || 'N/A'}</span>
          </td>
          <td class="py-3 px-4 font-mono text-xs"> ${formatCurrency(donatur.nominal)}
          </td>
          <td class="py-3 px-4 text-gray-400 ${isRecent ? 'font-semibold' : ''}">
            ${dateToJSDate(donatur.tanggal)}
          </td>
        `;
          tbody.appendChild(row);
     });
}

function initChart() {
     const chartContainer = document.getElementById('kas-chart');
     if (!chartContainer) {
          console.error("Chart container not found");
          return;
     }

     if (!kasChartData || kasChartData.length === 0) {
          chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400">No chart data available</div>';
          return;
     }

     const dateToJSDate = (date) => {
          const excelEpoch = new Date(1899, 11, 30); // 
          var date = new Date(excelEpoch.getTime() + date * 24 * 60 * 60 * 1000);
          var date = date.toISOString().split("T")[0];
          return date // Format YYYY-MM-DD
     }

     try {
          const chart = echarts.init(chartContainer);

          const dates = kasChartData.map(item => dateToJSDate(item.date) || 'N/A');
          const cumulativeValues = kasChartData.map(item => parseFloat(item.endValue) || 0);
          const dailyValues = kasChartData.map(item => parseFloat(item.daily) || 0);

          const option = {
               title: {
                    text: 'Dokumentasi Kas Kelas(Penarikan Bulanan)',
                    textStyle: {
                         color: '#ffffff',
                         fontSize: 18
                    },
                    left: 'center'
               },
               tooltip: {
                    trigger: 'axis',
                    backgroundColor: '#374151',
                    borderColor: '#6b7280',
                    textStyle: {
                         color: '#ffffff'
                    }
               },
               legend: {
                    data: ['Total Kas', 'Pemasukan Harian'],
                    textStyle: {
                         color: '#d1d5db'
                    },
                    bottom: 10
               },
               grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
               },
               xAxis: {
                    type: 'category',
                    data: dates,
                    axisLine: {
                         lineStyle: {
                              color: '#6b7280'
                         }
                    },
                    axisLabel: {
                         color: '#d1d5db',
                         rotate: 45
                    }
               },
               yAxis: [
                    {
                         type: 'value',
                         name: 'Total (IDR)',
                         position: 'left',
                         axisLine: {
                              lineStyle: {
                                   color: '#6b7280'
                              }
                         },
                         axisLabel: {
                              color: '#d1d5db',
                              formatter: '{value}'
                         },
                         splitLine: {
                              lineStyle: {
                                   color: '#374151'
                              }
                         }
                    },
                    {
                         type: 'value',
                         name: 'Harian (IDR)',
                         position: 'right',
                         axisLine: {
                              lineStyle: {
                                   color: '#6b7280'
                              }
                         },
                         axisLabel: {
                              color: '#d1d5db',
                              formatter: '{value}'
                         }
                    }
               ],
               series: [
                    {
                         name: 'Total Kas',
                         type: 'line',
                         data: cumulativeValues,
                         smooth: true,
                         lineStyle: {
                              color: '#3b82f6',
                              width: 3
                         },
                         itemStyle: {
                              color: '#3b82f6'
                         },
                         areaStyle: {
                              color: {
                                   type: 'linear',
                                   x: 0,
                                   y: 0,
                                   x2: 0,
                                   y2: 1,
                                   colorStops: [{
                                        offset: 0, color: 'rgba(59, 130, 246, 0.3)'
                                   }, {
                                        offset: 1, color: 'rgba(59, 130, 246, 0.1)'
                                   }]
                              }
                         }
                    },
                    {
                         name: 'Pemasukan Harian',
                         type: 'bar',
                         yAxisIndex: 1,
                         data: dailyValues,
                         itemStyle: {
                              color: '#10b981'
                         }
                    }
               ]
          };

          chart.setOption(option);

          // Make chart responsive
          window.addEventListener('resize', () => {
               chart.resize();
          });
     } catch (error) {
          console.error("Error initializing chart:", error);
          chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400">Error loading chart</div>';
     }
}

// Initialize data loading
async function initializeApp() {
     try {
          showToast("Loading data...");
          const {
               paymentData: loadedPaymentData,
               kasChartData: loadedKasChartData,
               dataKas: loadedDataKas,
               pengeluarData: loadedPengeluarData,
               dendaData: loadedDendaData,
               donaturData: loadedDonaturData
          } = await loadSheetData();

          // Update global variables
          paymentData = loadedPaymentData;
          kasChartData = loadedKasChartData;
          dataKas = loadedDataKas;
          pengeluarData = loadedPengeluarData;
          dendaData = loadedDendaData;
          donaturData = loadedDonaturData;

          console.log("Payment Data: Successfully loaded");
          console.log("Kas Chart Data: Successfully loaded");
          console.log("Data Kas: Successfully loaded");
          console.log("Pengeluaran Data: Successfully loaded");
          console.log("Denda Data: Successfully loaded")
          console.log("Donatur Data: Successfully loaded");

          // Initialize UI components
          loadPaymentTable(paymentData);
          loadDataKasTable(dataKas);
          LoadedPengeluarData(pengeluarData);
          LoadedDenda(dendaData);
          LoadedDonatur(donaturData);
          updateStats();
          initChart();

          showToast("Data loaded successfully!");
     } catch (error) {
          console.error("Failed to initialize app:", error);
          showToast("Failed to load data. Using default values.");

          // Initialize with empty data
          loadPaymentTable([]);
          loadDataKasTable([]);
          LoadedPengeluarData([]);
          LoadedDenda([]);
          LoadedDonatur([]);
          updateStats();
          initChart();
     }
}

window.onload = function () {
     try {
          // Generate QR codes
          generateQRCode("V3ivwjV6mKHZEaSET1S3yGff3Txwphyq7Zk42kk9SCS", "qr-solana");
          generateQRCode("0x8C940E048Df1040bcb3e1DEC5E3722432fd97757", "qr-eth");
          generateQRCode("0xe193f6fa1bd99183deba7fdfdfa7f5ccefc67c06efccc8d30b2aca0ecfa3b0d9", "qr-sui");
          generateQRCode("bc1pvu2v0pf264a0zq5jtr5007ywa4v564nf88g9hpvzt6g3wg4t6xpq4g58p6", "qr-btc-tap");
          generateQRCode("bc1q237mznr7v8wvsrt02d6tfwdpu3x9eawcvnecq6", "qr-btc-segwit");

          // Initialize app data
          initializeApp();
     } catch (error) {
          console.error("Error during initialization:", error);
          showToast("Initialization error occurred");
     }
};

function updateStats() {
     const totalAmountElement = document.getElementById('total-amount');
     const totalMembersElement = document.getElementById('total-members');
     const lastUpdateElement = document.getElementById('last-update');

     if (totalAmountElement) {
          const kasTotal = kasChartData && kasChartData.length > 0
               ? (kasChartData[kasChartData.length - 1]?.endValue || 0)
               : 0;

          const PengeluaranTotal = pengeluarData && pengeluarData.length > 0
               ? pengeluarData.reduce((sum, item) => sum + (parseFloat(item.harga_akhir) || 0), 0)
               : 0;

          const DendaTotal = dendaData && dendaData.length > 0
               ? dendaData.reduce((sum, item) => sum + (parseFloat(item.nominal) || 0), 0)
               : 0;

          const DonaturTotal = donaturData && donaturData.length > 0
               ? donaturData.reduce((sum, item) => sum + (parseFloat(item.nominal) || 0), 0)
               : 0;

          const netTotal = kasTotal - PengeluaranTotal + DendaTotal + DonaturTotal;
          totalAmountElement.textContent = `Rp${netTotal.toLocaleString('id-ID')}`;
     }

     if (totalMembersElement) {
          const totalMembers = paymentData ? paymentData.length : 0;
          totalMembersElement.textContent = totalMembers;
     }

     if (lastUpdateElement) {
          const lastUpdate = kasChartData && kasChartData.length > 0
               ? (kasChartData[kasChartData.length - 1]?.date || 'N/A')
               : 'N/A';

          const dateToJSDate = (lastUpdate) => {
               const excelEpoch = new Date(1899, 11, 30); // 
               var date = new Date(excelEpoch.getTime() + lastUpdate * 24 * 60 * 60 * 1000);
               var date = date.toISOString().split("T")[0];
               return date // Format YYYY-MM-DD
          }

          lastUpdateElement.textContent = dateToJSDate(lastUpdate) || 'N/A';
     }
}