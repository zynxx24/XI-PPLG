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
               <div class="photo-card group cursor-pointer rounded-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50" 
                    style="animation: slideUp 0.6s ease-out ${index * 0.1}s both"
                    onclick="window.photoGallery.openModal(${photo.id})">
                    <div class="relative overflow-hidden aspect-video">
                         <img src="${photo.image}" alt="${photo.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                         <div class="photo-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div class="text-6xl">👁️</div>
                         </div>
                    </div>
                    <div class="p-6">
                         <h3 class="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                              ${photo.emoji} ${photo.title}
                         </h3>
                         <p class="text-gray-400 text-sm mb-4 line-clamp-2">${photo.description}</p>
                         <div class="flex flex-wrap gap-2">
                              ${photo.tags.map(tag => `
                                   <span class="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
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
               btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
               btn.classList.add('bg-slate-800');
          });

          event.target.classList.remove('bg-slate-800');
          event.target.classList.add('active', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600');

          renderPhotos(category);
     };

     // Open modal
     const openModal = (photoId) => {
          const photo = state.photosData.find(p => p.id === photoId);
          if (!photo) return;

          const modal = document.getElementById('photoModal');
          document.getElementById('modalImage').src = photo.image;
          document.getElementById('modalTitle').textContent = `${photo.emoji} ${photo.title}`;
          document.getElementById('modalDescription').textContent = photo.description;
          document.getElementById('modalTags').innerHTML = photo.tags.map(tag => `
               <span class="px-4 py-2 bg-blue-600/30 text-blue-200 rounded-full text-sm font-semibold border border-blue-500/50">
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