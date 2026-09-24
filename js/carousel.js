/* ═══════════════════════════════════════════════════════════════════
   SCENE 6 — MEMORY LANE (Swiper.js)
   ═══════════════════════════════════════════════════════════════════

   ✏️  EDIT HERE: your photos live in SSM/images as memory1.jpg …
   memory13.jpg. Change the list below to add captions, reorder, or
   remove any photo. Leave caption: '' (or delete the key) for no text.
   ═══════════════════════════════════════════════════════════════════ */
const PHOTOS = [
  { src: 'images/memory1.jpg',  caption: '' },
  { src: 'images/memory2.jpg',  caption: '' },
  { src: 'images/memory3.jpg',  caption: '' },
  { src: 'images/memory4.jpg',  caption: '' },
  { src: 'images/memory5.jpg',  caption: '' },
  { src: 'images/memory6.jpg',  caption: '' },
  { src: 'images/memory7.jpg',  caption: '' },
  { src: 'images/memory8.jpg',  caption: '' },
  { src: 'images/memory9.jpg',  caption: '' },
  { src: 'images/memory10.jpg', caption: '' },
  { src: 'images/memory11.jpg', caption: '' },
  { src: 'images/memory12.jpg', caption: '' },
  { src: 'images/memory13.jpg', caption: '' },
];

function initCarousel() {
  const wrapper = document.getElementById('swiperWrapper');
  if (!wrapper) return;

  wrapper.innerHTML = PHOTOS.map((p) => `
    <div class="swiper-slide">
      <figure class="memory-card">
        <img src="${p.src}" alt="${p.caption || 'Memory'}" loading="lazy" />
        <figcaption class="memory-caption">${p.caption || ''}</figcaption>
      </figure>
    </div>
  `).join('');

  window.memorySwiper = new Swiper('#memorySwiper', {
    slidesPerView: 1.15,
    centeredSlides: true,
    spaceBetween: 16,
    grabCursor: true,
    loop: false,
    pagination: { el: '.swiper-pagination', clickable: true },
  });
}
