async function initPhotoGallery() {
     // State
     const state = {
          photosData: [],
          currentFilter: 'all'
     };

     // Load data
     try {
          const res = await fetch('./JSON/photo-data.JSON');
          state.photosData = await res.json();
     } catch (error) {
          console.error('Error loading photos data:', error);
          state.photosData = [];
     }

     // Render photos
     const renderPhotos = (filter = 'all') => {
          const gallery = document.getElementById('galleryGrid');
          const photoArray = Object.values(state.photosData);
          const photos = filter === 'all' ? photoArray : photoArray.filter(p => p.category === filter);

          gallery.innerHTML = photos.map((photo, index) => `
                <div class="photo-card group cursor-pointer rounded-2xl overflow-hidden bg-[#24283b]/80 backdrop-blur-sm border border-[#7aa2f7]/20 hover:border-[#7aa2f7]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#7aa2f7]/20" 
                     style="animation: slideUp 0.6s ease-out ${index * 0.1}s both"
                     onclick="window.photoGallery.openModal(${photo.id})">
                     <div class="relative overflow-hidden aspect-video">
                          <img src="${photo.image}" alt="${photo.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                          <div class="photo-overlay absolute inset-0 bg-[#1a1b26]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                               <div class="text-6xl drop-shadow-lg">👁️</div>
                          </div>
                     </div>
                     <div class="p-6">
                          <h3 class="text-xl font-bold mb-2 text-[#7aa2f7]">
                               ${photo.emoji} ${photo.title}
                          </h3>
                          <p class="text-[#a9b1d6] text-sm mb-4 line-clamp-2">${photo.description}</p>
                          <div class="flex flex-wrap gap-2">
                               ${photo.tags.map(tag => `
                                    <span class="px-3 py-1 bg-[#7aa2f7]/10 text-[#7aa2f7] rounded-full text-xs font-semibold border border-[#7aa2f7]/20">
                                         #${tag}
                                    </span>
                               `).join('')}
                          </div>
                     </div>
                </div>
           `).join('');

          updateStats();
     };

     // Update stats
     const updateStats = () => {
          const photoArray = Object.values(state.photosData);
          const filteredPhotos = state.currentFilter === 'all' ? photoArray : photoArray.filter(p => p.category === state.currentFilter);
          const categories = new Set(photoArray.map(p => p.category));

          document.getElementById('totalPhotos').textContent = filteredPhotos.length;
          document.getElementById('totalCategories').textContent = categories.size;
          document.getElementById('totalMemories').textContent = state.photosData.length;
     };

     // Filter photos
     const filterPhotos = (category, event) => {
          state.currentFilter = category;

          document.querySelectorAll('.filter-btn').forEach(btn => {
               // Remove active styles
               btn.classList.remove('active', 'bg-[#7aa2f7]', 'text-[#1a1b26]', 'shadow-[0_0_15px_rgba(122,162,247,0.5)]', 'border-[#7aa2f7]');
               // Add inactive styles
               btn.classList.add('bg-[#24283b]', 'text-[#a9b1d6]', 'border-[#7aa2f7]/20');
          });

          // Add active styles to clicked button
          event.target.classList.remove('bg-[#24283b]', 'text-[#a9b1d6]', 'border-[#7aa2f7]/20');
          event.target.classList.add('active', 'bg-[#7aa2f7]', 'text-[#1a1b26]', 'shadow-[0_0_15px_rgba(122,162,247,0.5)]', 'border-[#7aa2f7]');

          renderPhotos(category);
     };

     // Open modal
     const openModal = (photoId) => {
          const photo = state.photosData.find(p => p.id === photoId);
          if (!photo) return;

          const modal = document.getElementById('photoModal');
          document.getElementById('modalImage').src = photo.image;
          document.getElementById('modalTitle').className = "text-3xl font-black mb-4 text-[#7aa2f7]";
          document.getElementById('modalTags').innerHTML = photo.tags.map(tag => `
               <span class="px-4 py-2 bg-[#7aa2f7]/10 text-[#7aa2f7] rounded-full text-sm font-semibold border border-[#7aa2f7]/30">
                    #${tag}
               </span>
          `).join('');

          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
     };

     // Close modal
     const closeModal = () => {
          document.getElementById('photoModal').classList.remove('active');
          document.body.style.overflow = 'auto';
     };

     // Event listeners
     window.onclick = (event) => {
          const modal = document.getElementById('photoModal');
          if (event.target === modal) closeModal();
     };

     document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeModal();
     });

     // Expose public API
     window.photoGallery = {
          filterPhotos,
          openModal,
          closeModal,
          renderPhotos: () => renderPhotos(state.currentFilter)
     };

     // Initial render
     renderPhotos();
}

document.addEventListener('DOMContentLoaded', initPhotoGallery);