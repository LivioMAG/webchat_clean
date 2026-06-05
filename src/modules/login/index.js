async function handleLogin(event) {
  event.preventDefault();
  const email = elements.emailInput.value.trim().toLowerCase();
  const password = elements.passwordInput.value;

  if (state.isDemoMode) {
    const demoProfile = demoProfiles.find((profile) => profile.email === email) ?? demoProfiles[0];
    state.user = { id: demoProfile.id, email: demoProfile.email };
    state.currentProfile = demoProfile;
    state.hasAdminAccess = isAdminProfile(demoProfile);
    state.isAdminStatusResolved = true;
    await loadDemoData();
    showLoginMessage('Demo-Login erfolgreich.', false);
    render();
    return;
  }

  const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showLoginMessage(error.message);
    return;
  }

  state.session = data.session;
  state.user = data.user;
  state.hasAdminAccess = false;
  state.isAdminStatusResolved = false;
  await loadData();
  showLoginMessage('Login erfolgreich.', false);
  render();
}

async function handleForgotPassword() {
  const email = elements.emailInput.value.trim().toLowerCase();

  if (!email) {
    showLoginMessage('Bitte gib zuerst deine E-Mail-Adresse ein.');
    elements.emailInput.focus();
    return;
  }

  if (!elements.emailInput.checkValidity()) {
    showLoginMessage('Bitte gib eine gültige E-Mail-Adresse ein.');
    elements.emailInput.reportValidity();
    return;
  }

  if (state.isDemoMode) {
    showLoginMessage('Im Demo-Modus wird kein Magic Link versendet.', false);
    return;
  }

  elements.forgotPasswordButton.disabled = true;
  showLoginMessage('Magic Link wird versendet …', false);

  try {
    const { error } = await requestLoginMagicLink(email);

    if (error) {
      showLoginMessage(error.message);
      return;
    }

    showLoginMessage('Magic Link wurde versendet. Bitte prüfe dein E-Mail-Postfach.', false);
  } finally {
    elements.forgotPasswordButton.disabled = false;
  }
}

async function handleLogout() {
  if (state.isDemoMode) {
    resetAppState();
    showLoginMessage('Demo-Sitzung beendet.', false);
    render();
    return;
  }

  const { error } = await state.supabase.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }

  resetAppState();
  render();
}
