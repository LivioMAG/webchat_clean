async function initializeSupabase() {
  if (!window.supabase?.createClient) {
    setConnectionBadge('Supabase SDK fehlt', true);
    return;
  }

  try {
    const response = await fetch(CONFIG_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Konfigurationsdatei nicht gefunden. Demo-Modus aktiv.');
    }

    const config = parseSupabaseConfig(await response.text());
    if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
      throw new Error('config/supabase-config.json ist unvollständig. Demo-Modus aktiv.');
    }

    state.supabaseAnonKey = String(config.supabaseAnonKey || '').trim();
    state.missingReportsCallWebhookUrl = String(
      config?.webhooks?.missingReportsCall
      || config?.missingReportsCallWebhookUrl
      || DEFAULT_MISSING_REPORTS_CALL_WEBHOOK_URL,
    ).trim() || DEFAULT_MISSING_REPORTS_CALL_WEBHOOK_URL;
    state.missingReportsCallMobileUrl = String(
      config?.webhooks?.missingReportsCallMobileUrl
      || config?.missingReportsCallMobileUrl
      || DEFAULT_MISSING_REPORTS_CALL_MOBILE_URL,
    ).trim() || DEFAULT_MISSING_REPORTS_CALL_MOBILE_URL;
    state.supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    state.configReady = true;
    setConnectionBadge('Verbunden');
  } catch (error) {
    console.warn(error);
    state.isDemoMode = true;
    setConnectionBadge('Demo-Modus', true);
    showLoginMessage(`${getSupabaseConfigErrorMessage(error)} Mit Demo-Daten kann das UI trotzdem geprüft werden.`, false);
  }
}

function parseSupabaseConfig(rawConfig) {
  try {
    return JSON.parse(rawConfig);
  } catch (error) {
    throw new Error(`config/supabase-config.json enthält ungültiges JSON: ${formatJsonParseError(error)}. Demo-Modus aktiv.`);
  }
}

function formatJsonParseError(error) {
  return error?.message || 'Die Datei konnte nicht gelesen werden';
}

function getSupabaseConfigErrorMessage(error) {
  return error?.message || 'Supabase-Konfiguration konnte nicht geladen werden. Demo-Modus aktiv.';
}
