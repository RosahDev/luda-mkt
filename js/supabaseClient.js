(function () {
  const config = window.LUDA_SUPABASE_CONFIG || {};
  const SUPABASE_URL = config.url || 'https://lrkeaisnawnqlalknwnj.supabase.co';
  const SUPABASE_ANON_KEY = config.anonKey || 'sb_publishable_O4L6J7PlCbbSoJw3LTLNeQ_jHBQifsI';

  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  async function getSession() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signIn(email, password) {
    if (!supabase) {
      throw new Error('Supabase SDK não carregou corretamente.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  function normalizePortfolioItem(item) {
    const mediaList = Array.isArray(item.media_urls) ? item.media_urls : [];
    const media = mediaList.length ? mediaList : [item.cover_image || ''];
    const type = item.media_type === 'video' ? 'video' : media.length > 1 ? 'album' : 'image';

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      type,
      coverImage: item.cover_image || media[0] || '',
      media,
      description: item.description || '',
    };
  }

  async function saveLead(payload) {
    if (!supabase) {
      throw new Error('Supabase SDK não carregou corretamente. Verifique a CDN e a configuração.');
    }

    if (!SUPABASE_ANON_KEY) {
      throw new Error('Anon key do Supabase não configurada. Defina window.LUDA_SUPABASE_CONFIG.anonKey.');
    }

    const { data, error } = await supabase.from('leads').insert([
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        service_type: payload.service_type,
        event_date: payload.event_date || null,
        message: payload.message,
      },
    ]);

    if (error) {
      throw error;
    }

    return data;
  }

  async function getPortfolioItems() {
    if (!supabase || !SUPABASE_ANON_KEY) {
      return [];
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizePortfolioItem);
  }

  async function createPortfolioItem(payload) {
    if (!supabase || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase não configurado para criar itens de portfólio.');
    }

    const { data, error } = await supabase.from('portfolio_items').insert([
      {
        title: payload.title,
        category: payload.category,
        media_type: payload.media_type,
        cover_image: payload.cover_image,
        media_urls: payload.media_urls || [],
        description: payload.description || '',
        active: true,
      },
    ]);

    if (error) {
      throw error;
    }

    return data;
  }

  async function uploadPortfolioMedia(files) {
    if (!supabase || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase não configurado para enviar mídias.');
    }

    const uploadedUrls = [];

    for (const file of files) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const { error } = await supabase.storage.from('portfolio').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function deletePortfolioItem(id) {
    if (!supabase || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase não configurado para excluir itens de portfólio.');
    }

    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);

    if (error) {
      throw error;
    }
  }

  async function listPortfolioItems() {
    return getPortfolioItems();
  }

  window.LUDA_SUPABASE = {
    config: { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY },
    supabase,
    saveLead,
    getSession,
    signIn,
    signOut,
    getPortfolioItems,
    listPortfolioItems,
    createPortfolioItem,
    uploadPortfolioMedia,
    deletePortfolioItem,
  };
})();
