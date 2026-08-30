document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const closeLightboxBtn = document.querySelector('.lightbox-close');
  const leadForm = document.getElementById('lead-form');
  const formMessage = document.getElementById('form-message');
  const hero = document.querySelector('.hero');
  const heroPanel = document.querySelector('.hero-panel');
  const heroNetwork = document.getElementById('heroNetwork');

  const fallbackPortfolioItems = [
    {
      title: 'Evento Noturno',
      category: 'eventos',
      type: 'album',
      media: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      ],
    },
    {
      title: 'Track Day',
      category: 'automotivo',
      type: 'video',
      media: ['https://www.w3schools.com/html/mov_bbb.mp4'],
    },
    {
      title: 'Aniversário Premium',
      category: 'celebracoes',
      type: 'image',
      media: ['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'],
    },
    {
      title: 'Reels de Marca',
      category: 'social',
      type: 'video',
      media: ['https://www.w3schools.com/html/movie.mp4'],
    },
    {
      title: 'Produção Corporativa',
      category: 'eventos',
      type: 'image',
      media: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'],
    },
    {
      title: 'Detalhes Automotivos',
      category: 'automotivo',
      type: 'image',
      media: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'],
    },
    {
      title: 'Celebração',
      category: 'celebracoes',
      type: 'album',
      media: [
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      ],
    },
    {
      title: 'Conteúdo de Redes',
      category: 'social',
      type: 'image',
      media: ['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80'],
    },
  ];

  let activePortfolioItems = [...fallbackPortfolioItems];
  let lightboxState = {
    index: 0,
    items: [],
  };

  function startHeroNetwork() {
    if (!heroNetwork || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = heroNetwork.getContext('2d');
    if (!context) return;

    const particles = [];
    const particleCount = window.innerWidth < 760 ? 24 : 42;
    let width = 0;
    let height = 0;

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = heroNetwork.clientWidth;
      height = heroNetwork.clientHeight;
      heroNetwork.width = width * pixelRatio;
      heroNetwork.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        speedX: (Math.random() - 0.5) * 0.00022,
        speedY: (Math.random() - 0.5) * 0.00018,
        radius: Math.random() * 1.5 + 1,
      });
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < 0 || particle.x > 1) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > 1) particle.speedY *= -1;
      });

      particles.forEach((particle, index) => {
        const x = particle.x * width;
        const y = particle.y * height;
        context.fillStyle = 'rgba(183, 161, 255, 0.7)';
        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fill();

        particles.slice(index + 1).forEach((other) => {
          const otherX = other.x * width;
          const otherY = other.y * height;
          const distance = Math.hypot(x - otherX, y - otherY);
          if (distance > 145) return;
          context.strokeStyle = `rgba(183, 161, 255, ${0.16 * (1 - distance / 145)})`;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(otherX, otherY);
          context.stroke();
        });
      });

      window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  if (hero && heroPanel && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroPanel.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${y * -4}deg) translateY(-4px)`;
    });

    hero.addEventListener('pointerleave', () => {
      heroPanel.style.transform = '';
    });
  }

  function normalizePortfolioItems(items) {
    return items.map((item) => {
      const media = Array.isArray(item.media) ? item.media : item.media_urls || [];
      const resolvedMedia = media.length ? media : [item.coverImage || item.cover_image || ''];
      return {
        title: item.title || 'Projeto LUDA',
        category: item.category || 'eventos',
        type: item.type || (item.media_type === 'video' ? 'video' : resolvedMedia.length > 1 ? 'album' : 'image'),
        media: resolvedMedia,
      };
    });
  }

  function createGallery() {
    galleryGrid.innerHTML = activePortfolioItems
      .map((item, index) => {
        const cover = item.media[0];
        const itemType = item.type === 'video' ? 'video' : '';
        const galleryData = JSON.stringify(item.media);
        return `
          <article class="gallery-item reveal stagger-item ${itemType}" data-index="${index}" data-category="${item.category}" data-type="${item.type}" data-title="${item.title}" data-gallery='${galleryData.replace(/'/g, '&apos;')}' style="--index:${index};background-image:url('${cover}')">
            <div class="gallery-meta">
              <div>
                <strong>${item.title}</strong>
                <span>${item.category}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
    observeReveals();
  }

  function observeReveals() {
    const revealItems = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('.section-heading, .about-copy, .point-card, .service-card, .metric-card, .contact-copy, .lead-form').forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--index', index % 5);
  });

  function filterGallery(category) {
    const items = galleryGrid.querySelectorAll('.gallery-item');

    items.forEach((item) => {
      const shouldShow = category === 'all' || item.dataset.category === category;
      item.style.display = shouldShow ? 'block' : 'none';
    });
  }

  function updateLightboxContent() {
    const current = lightboxState.items[lightboxState.index];
    if (!current) return;

    if (current.type === 'video') {
      lightboxImage.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = current.src;
      lightboxVideo.play();
      lightboxTitle.textContent = current.title;
      return;
    }

    lightboxVideo.style.display = 'none';
    lightboxImage.style.display = 'block';
    lightboxImage.src = current.src;
    lightboxImage.alt = current.title;
    lightboxTitle.textContent = current.title;
  }

  function openLightbox(item) {
    if (!item) return;

    const parsedGallery = item.dataset.gallery ? JSON.parse(item.dataset.gallery) : [];
    const galleryItems = parsedGallery.length
      ? parsedGallery.map((src, index) => ({
          src,
          title: item.dataset.title,
          type: item.dataset.type === 'video' ? 'video' : 'image',
          groupIndex: index,
        }))
      : [
          {
            src: item.dataset.src || item.dataset.gallery,
            title: item.dataset.title,
            type: item.dataset.type === 'video' ? 'video' : 'image',
            groupIndex: 0,
          },
        ];

    lightboxState.items = galleryItems;
    lightboxState.index = 0;
    updateLightboxContent();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxVideo.pause();
    lightboxVideo.src = '';
  }

  function navigateLightbox(direction) {
    if (!lightboxState.items.length) return;

    lightboxState.index = (lightboxState.index + direction + lightboxState.items.length) % lightboxState.items.length;
    updateLightboxContent();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      header.classList.toggle('is-open', !expanded);
      menuToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      filterGallery(button.dataset.filter);
    });
  });

  galleryGrid.addEventListener('click', (event) => {
    const item = event.target.closest('.gallery-item');
    if (!item) return;
    openLightbox(item);
  });

  closeLightboxBtn.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }

    if (event.key === 'ArrowRight' && lightbox.classList.contains('active')) {
      navigateLightbox(1);
    }

    if (event.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
      navigateLightbox(-1);
    }
  });

  async function loadPortfolio() {
    try {
      if (window.LUDA_SUPABASE && typeof window.LUDA_SUPABASE.getPortfolioItems === 'function') {
        const remoteItems = await window.LUDA_SUPABASE.getPortfolioItems();
        if (remoteItems.length) {
          activePortfolioItems = normalizePortfolioItems(remoteItems);
        }
      }
    } catch (error) {
      console.warn('Não foi possível carregar o portfólio do Supabase. Usando dados locais.', error);
      activePortfolioItems = [...fallbackPortfolioItems];
    }

    createGallery();
    filterGallery('all');
  }

  function setFormMessage(message, type = '') {
    formMessage.textContent = message;
    formMessage.className = 'form-message';
    if (type) {
      formMessage.classList.add(type);
    }
  }

  function buildWhatsAppMessage(formData) {
    return [
      'Olá, LUDA Marketing! Gostaria de solicitar um orçamento.',
      '',
      '*Briefing do projeto*',
      `Nome: ${formData.name}`,
      `WhatsApp: ${formData.phone}`,
      `Produção: ${formData.service_type}`,
      `Data prevista: ${formData.event_date || 'Não informada'}`,
      `Local: ${formData.location || 'Não informado'}`,
      `Assunto: ${formData.subject}`,
      `Ideias e detalhes: ${formData.message}`,
    ].join('\n');
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(leadForm);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        service_type: String(formData.get('service_type') || '').trim(),
        event_date: String(formData.get('event_date') || '').trim(),
        location: String(formData.get('location') || '').trim(),
        subject: String(formData.get('subject') || '').trim(),
        message: String(formData.get('message') || '').trim(),
      };

      if (!payload.name || !payload.phone || !payload.service_type || !payload.subject || !payload.message) {
        setFormMessage('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      const submitButton = leadForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      try {
        const message = buildWhatsAppMessage(payload);
        const url = `https://wa.me/5516997270867?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');

        setFormMessage('Seu pedido foi enviado com sucesso. Também abrimos o WhatsApp para continuidade.', 'success');
        leadForm.reset();
      } catch (error) {
        console.error(error);
        setFormMessage('Não foi possível salvar o lead. Tente novamente ou envie diretamente pelo WhatsApp.', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar orçamento pelo WhatsApp';
      }
    });
  }

  loadPortfolio();
  observeReveals();
  startHeroNetwork();
});
