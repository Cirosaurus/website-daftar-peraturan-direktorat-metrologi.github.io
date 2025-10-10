document.addEventListener('DOMContentLoaded', () => {
    // --- Bagian 1: Pengaturan Awal ---
    const listContainer = document.getElementById('peraturan-list-container');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const searchButton = document.querySelector('.filter-section button');
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewFrame');
    const closeBtn = document.querySelector('.close-button');

    let allRegulations = []; // Variabel untuk menyimpan SEMUA data dari JSON

    // --- Bagian 2: Fungsi untuk Menampilkan Data ---
    // Fungsi ini bisa menampilkan array peraturan APAPUN ke dalam HTML
    function displayRegulations(items) {
        listContainer.innerHTML = ''; // Kosongkan daftar sebelum menampilkan hasil baru
        if (items.length === 0) {
            listContainer.innerHTML = `<p class="status-message" style="color: red;">Data peraturan tidak ditemukan.</p>`;
            return;
        }

        items.forEach(item => {
            const previewUrl = item.link_view ? item.link_view.replace('/view', '/preview').split('?')[0] : '#';
            const downloadUrl = item.link_download || '#';

            const itemHTML = `
                <div class="peraturan-item" data-category="${item.kategori}">
                    <h3><a href="${item.link_view}" target="_blank">${item.judul}</a></h3>
                    <p>${item.deskripsi}</p>
                    <div class="metadata">
                        <span class="tanggal">${item.tanggal}</span>
                        <span class="status ${item.status}">${item.status}</span>
                    </div>
                    <div class="button-container">
                        <button type="button" class="preview-button" data-preview-url="${previewUrl}">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <a href="${downloadUrl}" class="download-button" download>
                            <i class="fas fa-file-pdf"></i> Unduh
                        </a>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // --- Bagian 3: Fungsi untuk Melakukan Filter ---
    function performFilter() {
        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedYear = yearFilter.value;

        // Mulai dengan semua data, lalu saring berdasarkan setiap kriteria
        const filteredData = allRegulations.filter(item => {
            const textMatch = item.judul.toLowerCase().includes(searchText) || item.deskripsi.toLowerCase().includes(searchText);
            const categoryMatch = !selectedCategory || item.kategori === selectedCategory;

            // Ekstrak tahun dari judul (misal: "Undang-Undang Nomor 2 Tahun 1981")
            const yearInTitle = item.judul.match(/\b\d{4}\b/);
            const itemYear = yearInTitle ? yearInTitle[0] : null;
            const yearMatch = !selectedYear || itemYear === selectedYear;

            return textMatch && categoryMatch && yearMatch;
        });

        displayRegulations(filteredData); // Tampilkan hasil yang sudah difilter
    }

    // --- Bagian 4: Memuat Data Awal dan Mengaktifkan Filter ---
    async function initializeApp() {


        function populateYearFilter() {
            const startYear = 1981;
            const endYear = 2025;

            // Tambahkan opsi default "Semua Tahun"
            yearFilter.innerHTML = '<option value="">Semua Tahun</option>';

            // Loop dari tahun terakhir ke tahun pertama
            for (let year = endYear; year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            }
        }

        populateYearFilter()

        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            allRegulations = await response.json(); // Simpan data ke variabel
            displayRegulations(allRegulations); // Tampilkan semua data saat pertama kali dimuat

            // Aktifkan event listener SETELAH data berhasil dimuat
            searchInput.addEventListener('keyup', performFilter);
            categoryFilter.addEventListener('change', performFilter);
            yearFilter.addEventListener('change', performFilter);
            searchButton.addEventListener('click', performFilter);

             const pageHeader = document.querySelector('.page-header');
        if (searchButton && pageHeader) {
            searchButton.addEventListener('click', (event) => {
                // Mencegah perilaku default tombol jika suatu saat dimasukkan ke dalam <form>
                event.preventDefault(); 
                
                // Lakukan scroll ke bagian header halaman
                pageHeader.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }

        } catch (error) {
            console.error('Gagal memuat data peraturan:', error);
            listContainer.innerHTML = `<p class="status-message" style="color: red;">Data peraturan tidak ditemukan</p>`;
        }
    }

    // --- Bagian 5: Logika untuk Modal Preview ---
    function openModal(url) {
        if (url && url !== '#') {
            iframe.src = url;
            modal.style.display = 'block';
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        iframe.src = '';
    }

    listContainer.addEventListener('click', event => {
        const button = event.target.closest('.preview-button');
        if (button) openModal(button.dataset.previewUrl);
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', event => (event.target == modal) && closeModal());

    // --- Jalankan Aplikasi ---
    initializeApp();
});

