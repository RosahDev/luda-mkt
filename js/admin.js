document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('loginScreen');
  const adminScreen = document.getElementById('adminScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  const adminPortfolioForm = document.getElementById('adminPortfolioForm');
  const adminMessage = document.getElementById('adminMessage');
  const portfolioList = document.getElementById('portfolioList');
  const logoutBtn = document.getElementById('logoutBtn');
  const mediaFilesInput = document.getElementById('mediaFiles');
  const mediaDropzone = document.getElementById('mediaDropzone');
  const mediaPreviewList = document.getElementById('mediaPreviewList');
  const mediaTypeInput = adminPortfolioForm.querySelector('[name="media_type"]');
  const videoCoverField = document.getElementById('videoCoverField');
  const videoCoverInput = document.getElementById('videoCoverFile');
  const videoCoverPreview = document.getElementById('videoCoverPreview');
  let selectedMediaFiles = [];
  let selectedCoverFile = null;
  let selectedCoverIndex = 0;

  function isLoggedIn() {
    return !!window.LUDA_SUPABASE?.supabase?.auth?.getSession && !!localStorage.getItem('sb-lrkeaisnawnqlalknwnj-auth-token');
  }

  function setLoginStatus(isLogged) {
    loginScreen.classList.toggle('hidden', isLogged);
    adminScreen.classList.toggle('hidden', !isLogged);
  }

  function renderList(items) {
    if (!items.length) {
      portfolioList.innerHTML = '<li><span>Nenhum item cadastrado.</span></li>';
      return;
    }

    portfolioList.innerHTML = items
      .map(
        (item) => `
          <li>
            <span>${item.title} · ${item.category}</span>
            <button class="delete-btn" data-id="${item.id}" type="button">Excluir</button>
          </li>
        `,
      )
      .join('');

    portfolioList.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (!id) return;

        try {
          if (window.LUDA_SUPABASE && typeof window.LUDA_SUPABASE.deletePortfolioItem === 'function') {
            await window.LUDA_SUPABASE.deletePortfolioItem(id);
            await loadPortfolio();
            adminMessage.textContent = 'Item removido com sucesso.';
            adminMessage.className = 'form-message success';
          }
        } catch (error) {
          console.error(error);
          adminMessage.textContent = 'Erro ao excluir item.';
          adminMessage.className = 'form-message error';
        }
      });
    });
  }

  async function loadPortfolio() {
    try {
      if (window.LUDA_SUPABASE && typeof window.LUDA_SUPABASE.listPortfolioItems === 'function') {
        const items = await window.LUDA_SUPABASE.listPortfolioItems();
        renderList(items);
      }
    } catch (error) {
      console.error(error);
      renderList([]);
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
      loginMessage.textContent = 'Informe e-mail e senha.';
      loginMessage.className = 'form-message error';
      return;
    }

    try {
      if (!window.LUDA_SUPABASE || typeof window.LUDA_SUPABASE.signIn !== 'function') {
        throw new Error('Supabase client não inicializado.');
      }

      await window.LUDA_SUPABASE.signIn(email, password);
      setLoginStatus(true);
      loginMessage.textContent = '';
      await loadPortfolio();
    } catch (error) {
      console.error(error);
      loginMessage.textContent = 'Credenciais inválidas ou usuário não encontrado.';
      loginMessage.className = 'form-message error';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      if (window.LUDA_SUPABASE && typeof window.LUDA_SUPABASE.signOut === 'function') {
        await window.LUDA_SUPABASE.signOut();
      }
      setLoginStatus(false);
      loginForm.reset();
    } catch (error) {
      console.error(error);
      setLoginStatus(false);
      loginForm.reset();
    }
  });

  function renderMediaPreviews() {
    mediaPreviewList.innerHTML = '';

    selectedMediaFiles.forEach((file, index) => {
      const preview = document.createElement('article');
      preview.className = 'media-preview';

      const media = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('img');
      media.src = URL.createObjectURL(file);
      media.className = 'media-preview-thumb';
      media.setAttribute('aria-label', file.name);
      if (media.tagName === 'VIDEO') media.muted = true;

      const details = document.createElement('div');
      details.className = 'media-preview-details';
      details.innerHTML = `<strong>${file.name}</strong><small>${Math.ceil(file.size / 1024)} KB</small>`;

      const coverLabel = document.createElement('label');
      coverLabel.className = 'cover-choice';
      const coverCheckbox = document.createElement('input');
      coverCheckbox.type = 'checkbox';
      coverCheckbox.checked = index === selectedCoverIndex;
      coverCheckbox.setAttribute('aria-label', `Usar ${file.name} como capa`);
      coverCheckbox.addEventListener('change', () => {
        if (!coverCheckbox.checked) {
          coverCheckbox.checked = true;
          return;
        }
        selectedCoverIndex = index;
        renderMediaPreviews();
      });
      const coverText = document.createElement('small');
      coverText.textContent = 'Capa';
      coverLabel.append(coverCheckbox, coverText);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'delete-btn';
      removeButton.textContent = 'Remover';
      removeButton.addEventListener('click', () => {
        selectedMediaFiles.splice(index, 1);
        if (selectedCoverIndex >= selectedMediaFiles.length) selectedCoverIndex = Math.max(0, selectedMediaFiles.length - 1);
        renderMediaPreviews();
      });

      preview.append(media, details, coverLabel, removeButton);
      mediaPreviewList.appendChild(preview);
    });
  }

  function addMediaFiles(files) {
    const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    selectedMediaFiles = [...selectedMediaFiles, ...validFiles];
    if (selectedMediaFiles.length === validFiles.length) selectedCoverIndex = 0;
    renderMediaPreviews();
  }

  function renderVideoCoverPreview() {
    videoCoverPreview.innerHTML = '';
    if (!selectedCoverFile) return;
    const image = document.createElement('img');
    image.src = URL.createObjectURL(selectedCoverFile);
    image.alt = `Capa selecionada: ${selectedCoverFile.name}`;
    image.className = 'media-preview-thumb';
    const name = document.createElement('small');
    name.textContent = selectedCoverFile.name;
    videoCoverPreview.append(image, name);
  }

  function syncMediaTypeFields() {
    const isVideo = mediaTypeInput.value === 'video';
    videoCoverField.classList.toggle('hidden', !isVideo);
    if (!isVideo) {
      selectedCoverFile = null;
      videoCoverInput.value = '';
      renderVideoCoverPreview();
    }
  }

  mediaFilesInput.addEventListener('change', () => {
    addMediaFiles(Array.from(mediaFilesInput.files));
    mediaFilesInput.value = '';
  });

  mediaTypeInput.addEventListener('change', syncMediaTypeFields);
  videoCoverInput.addEventListener('change', () => {
    selectedCoverFile = videoCoverInput.files[0] || null;
    renderVideoCoverPreview();
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    mediaDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      mediaDropzone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    mediaDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      mediaDropzone.classList.remove('is-dragging');
    });
  });

  mediaDropzone.addEventListener('drop', (event) => {
    addMediaFiles(Array.from(event.dataTransfer.files));
  });

  adminPortfolioForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(adminPortfolioForm);
    const payload = {
      title: String(formData.get('title') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      media_type: String(formData.get('media_type') || 'image'),
      description: String(formData.get('description') || '').trim(),
    };

    try {
      if (!selectedMediaFiles.length) {
        throw new Error('Selecione pelo menos um arquivo de mídia.');
      }

      if (!window.LUDA_SUPABASE || typeof window.LUDA_SUPABASE.uploadPortfolioMedia !== 'function') {
        throw new Error('Upload de mídia não configurado.');
      }

      adminMessage.textContent = 'Enviando arquivos...';
      adminMessage.className = 'form-message';
      const mediaUrls = await window.LUDA_SUPABASE.uploadPortfolioMedia(selectedMediaFiles);
      payload.cover_image = mediaUrls[selectedCoverIndex] || mediaUrls[0];
      payload.media_urls = mediaUrls;

      if (payload.media_type === 'video' && selectedCoverFile) {
        const coverUrls = await window.LUDA_SUPABASE.uploadPortfolioMedia([selectedCoverFile]);
        payload.cover_image = coverUrls[0];
      }

      if (window.LUDA_SUPABASE && typeof window.LUDA_SUPABASE.createPortfolioItem === 'function') {
        await window.LUDA_SUPABASE.createPortfolioItem(payload);
        adminPortfolioForm.reset();
        selectedMediaFiles = [];
        selectedCoverFile = null;
        selectedCoverIndex = 0;
        renderMediaPreviews();
        renderVideoCoverPreview();
        syncMediaTypeFields();
        adminMessage.textContent = 'Item do portfólio salvo com sucesso.';
        adminMessage.className = 'form-message success';
        await loadPortfolio();
      }
    } catch (error) {
      console.error(error);
      adminMessage.textContent = 'Erro ao salvar item do portfólio.';
      adminMessage.className = 'form-message error';
    }
  });

  async function syncAuthState() {
    try {
      const session = await window.LUDA_SUPABASE?.getSession?.();
      setLoginStatus(!!session);
      if (session) {
        await loadPortfolio();
      }
    } catch (error) {
      console.error(error);
      setLoginStatus(false);
    }
  }

  syncMediaTypeFields();
  syncAuthState();
});
