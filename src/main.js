// Interactive Scripts for Gabriel's Video Editor Portfolio
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // Helper to format YouTube URLs into valid embed URLs if needed
  function formatEmbedUrl(url) {
    if (!url) return '';
    url = url.trim();
    // YouTube Shorts: https://www.youtube.com/shorts/ID
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('youtube.com/shorts/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0`;
    }
    // YouTube Short link: https://youtu.be/ID
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0`;
    }
    // YouTube Watch: https://www.youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&rel=0`;
    }
    // Already an embed link
    if (url.includes('youtube.com/embed/') && !url.includes('enablejsapi=1')) {
      return url + (url.includes('?') ? '&' : '?') + 'enablejsapi=1&rel=0';
    }
    return url;
  }

  // Automatically normalize all iframes on load (in case user pasted a raw Shorts or youtu.be link)
  document.querySelectorAll('.video-iframe').forEach(iframe => {
    const currentSrc = iframe.getAttribute('src');
    if (currentSrc) {
      const formatted = formatEmbedUrl(currentSrc);
      if (formatted !== currentSrc) {
        iframe.setAttribute('src', formatted);
      }
    }
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Video Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const videoCards = document.querySelectorAll('.video-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-brand-500', 'text-black', 'shadow-md', 'shadow-brand-500/20');
        b.classList.add('card-glass', 'text-zinc-300');
      });
      btn.classList.add('bg-brand-500', 'text-black', 'shadow-md', 'shadow-brand-500/20');
      btn.classList.remove('card-glass', 'text-zinc-300');

      const filterValue = btn.getAttribute('data-filter');

      videoCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Play Video on Card Click (Dissolves Cover & Auto-plays Iframe)
  function playCardVideo(card) {
    if (!card) return;
    const cover = card.querySelector('.video-cover');
    const iframe = card.querySelector('.video-iframe');

    if (cover) {
      cover.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        cover.style.display = 'none';
      }, 300);
    }

    if (iframe) {
      let src = iframe.getAttribute('src') || '';
      src = formatEmbedUrl(src);

      // Add autoplay=1 if not present
      if (!src.includes('autoplay=1')) {
        src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
        iframe.setAttribute('src', src);
      }

      // Send YouTube JS API play command
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } catch (err) {
        // fallback ignored
      }
    }
  }

  // Attach click listener to each video cover and watch-cut button
  document.querySelectorAll('.video-card').forEach(card => {
    const cover = card.querySelector('.video-cover');
    const watchCutBtn = card.querySelector('.watch-cut-btn');

    if (cover) {
      cover.addEventListener('click', () => {
        playCardVideo(card);
      });
    }

    if (watchCutBtn) {
      watchCutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playCardVideo(card);
      });
    }
  });

  // Modal Video Player Setup (Enhanced for YouTube Iframes)
  const videoModal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close');
  const modalIframe = document.getElementById('modal-iframe');
  const modalTitle = document.getElementById('modal-title');
  const modalTags = document.getElementById('modal-tags');
  const modalTriggers = document.querySelectorAll('.open-modal-btn');

  if (videoModal && modalClose && modalIframe) {
    modalTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.video-card');
        const iframe = card?.querySelector('.video-iframe');
        const title = card?.querySelector('.video-title')?.innerText || 'Vertical Video';
        const tags = card?.querySelector('.video-tags')?.innerText || 'Dynamic Captions · SFX';

        let src = iframe?.getAttribute('src') || '';
        if (src) {
          src = formatEmbedUrl(src);
          if (!src.includes('autoplay=1')) {
            src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
          }
          modalIframe.src = src;
        }

        if (modalTitle) modalTitle.innerText = title;
        if (modalTags) modalTags.innerText = tags;

        videoModal.classList.remove('hidden');
        videoModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      videoModal.classList.add('hidden');
      videoModal.classList.remove('flex');
      modalIframe.src = '';
      document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // Quick WhatsApp Contact Form
  const contactForm = document.getElementById('quick-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('contact-email');
      const email = emailInput ? emailInput.value : '';
      if (email) {
        const waUrl = `https://wa.me/5516994063622?text=${encodeURIComponent(
          `Hi Gabriel! I saw your portfolio and I want to scale my vertical video content. My email is ${email}. Let's talk!`
        )}`;
        window.open(waUrl, '_blank');
      }
    });
  }
});
