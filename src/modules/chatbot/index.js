function getN8nChatMetadata() {
  const user = state.user || {};
  const profile = state.currentProfile || {};
  const metadata = {
    source: 'wochenrapport-webplattform',
    user_id: user.id || profile.id || '',
    profile_id: profile.id || user.id || '',
    email: user.email || profile.email || '',
    full_name: profile.full_name || user.user_metadata?.full_name || user.email || '',
    role_label: profile.role_label || '',
    is_admin: Boolean(profile.is_admin || state.hasAdminAccess),
  };

  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

async function initializeEmbeddedChatbot() {
  const webhookUrl = String(state.n8nChatWebhookUrl || '').trim();
  if (!webhookUrl || !state.user) {
    return;
  }

  const metadata = getN8nChatMetadata();
  const metadataSignature = JSON.stringify(metadata);
  if (state.n8nChatInitialized && state.n8nChatMetadataSignature === metadataSignature) {
    return;
  }

  if (state.n8nChatInitialized) {
    console.warn('n8n Chat wurde bereits initialisiert; aktualisierte Metadaten werden erst nach einem Neuladen übernommen.', metadata);
    return;
  }

  ensureN8nChatRoot();
  ensureN8nChatStylesheet();

  try {
    const createChat = await resolveN8nCreateChat();
    if (typeof createChat !== 'function') {
      throw new Error('createChat ist nicht verfügbar.');
    }

    createChat({
      webhookUrl,
      target: '#n8nChatbotRoot',
      metadata,
    });
    state.n8nChatInitialized = true;
    state.n8nChatMetadataSignature = metadataSignature;
  } catch (error) {
    console.warn('n8n Chat konnte nicht initialisiert werden.', error);
  }
}

function resetEmbeddedChatbot() {
  const root = document.getElementById('n8nChatbotRoot');
  if (root) {
    root.replaceChildren();
  }
  state.n8nChatInitialized = false;
  state.n8nChatMetadataSignature = '';
}

function ensureN8nChatRoot() {
  let root = document.getElementById('n8nChatbotRoot');
  if (root) {
    return root;
  }

  root = document.createElement('div');
  root.id = 'n8nChatbotRoot';
  document.body.appendChild(root);
  return root;
}

function ensureN8nChatStylesheet() {
  if (document.querySelector('link[data-n8n-chat-stylesheet="true"]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = N8N_CHAT_STYLESHEET_URL;
  link.dataset.n8nChatStylesheet = 'true';
  document.head.appendChild(link);
}

async function resolveN8nCreateChat() {
  if (typeof window.createChat === 'function') {
    return window.createChat;
  }

  const chatModule = await import(N8N_CHAT_MODULE_URL);
  return chatModule.createChat;
}
