// ---------- Profiles ----------
// Several players on one browser, each with their own save and an optional password.
// The password only stops people opening each other's saves by accident: everything still
// lives in this browser's storage. To go online later, swap Store and checkPw for server
// calls, then copy the account's save into PROFILE.saveKey before starting the game.
(() => {
  const PROFILES_KEY = 'foodRngProfiles';
  const OLD_SAVE_KEY = 'foodRngSave'; // the single save from before profiles
  const SESSION_KEY = 'foodRngUser';  // who's logged in, for this tab only
  const NAME_RE = /^[\p{L}\p{N} _-]{1,16}$/u;
  const $ = id => document.getElementById(id);

  const Store = {
    get() {
      const data = JSON.parse(localStorage.getItem(PROFILES_KEY)) || {};
      data.users = data.users || {};
      return data;
    },
    set(data) { localStorage.setItem(PROFILES_KEY, JSON.stringify(data)); },
  };
  const saveKeyOf = id => `${OLD_SAVE_KEY}:${id}`;
  const idOf = name => name.trim().toLowerCase();
  const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');

  async function hashPw(pw, salt, algo) {
    if (algo === 'pbkdf2') {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
      return hex(new Uint8Array(bits));
    }
    // Browsers without crypto.subtle (plain http pages): a simple hash, still never the password itself
    let h = 2166136261;
    const s = salt + pw;
    for (let r = 0; r < 5000; r++) for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h.toString(16);
  }
  async function makePw(pw) {
    if (!pw) return { salt: null, hash: null, algo: null };
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const algo = window.crypto && crypto.subtle ? 'pbkdf2' : 'simple';
    return { salt, algo, hash: await hashPw(pw, salt, algo) };
  }
  async function checkPw(user, pw) {
    if (!user.hash) return true;
    return (await hashPw(pw, user.salt, user.algo)) === user.hash;
  }

  let data;
  try {
    data = Store.get();
  } catch (e) {
    // Storage blocked: play without profiles (nothing will be saved anyway)
    return start(null);
  }
  const hasOldSave = () => { try { return !!localStorage.getItem(OLD_SAVE_KEY); } catch (e) { return false; } };

  function start(id) {
    window.PROFILE = id ? { id, name: data.users[id].name, saveKey: saveKeyOf(id) } : null;
    $('loginScreen').hidden = true;
    if (id) {
      $('profileBtn').hidden = false;
      $('profileBtn').textContent = `👤 ${PROFILE.name}`;
      $('profileSetting').hidden = false;
      $('profileNote').textContent = `Playing as ${PROFILE.name}${data.users[id].hash ? ' 🔒' : ''}.`;
    }
    const s = document.createElement('script');
    s.src = 'game.js';
    document.body.appendChild(s);
  }

  // Log out and go back to "Who's playing?". The game saves itself on the way out.
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* blocked */ }
    if (data.remember) { delete data.remember; Store.set(data); }
    location.reload();
  }
  function enter(id, remember) {
    try { sessionStorage.setItem(SESSION_KEY, id); } catch (e) { /* blocked */ }
    if (remember) data.remember = id; else delete data.remember;
    Store.set(data);
    start(id);
  }

  // ---------- "Who's playing?" screen ----------
  const err = text => { $('loginError').textContent = text || ''; };
  function show(view) {
    for (const v of ['profileList', 'loginForm', 'newForm']) $(v).hidden = v !== view;
    err('');
  }
  let picked = null;

  function renderList() {
    const list = $('profileList');
    list.innerHTML = '';
    const users = Object.entries(data.users).sort((a, b) => a[1].name.localeCompare(b[1].name));
    for (const [id, u] of users) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'profile-pick';
      b.textContent = `👤 ${u.name}${u.hash ? ' 🔒' : ''}`;
      b.addEventListener('click', () => pick(id));
      list.appendChild(b);
    }
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'profile-pick profile-new';
    add.textContent = '➕ New profile';
    add.addEventListener('click', openNew);
    list.appendChild(add);
    if (!users.length) {
      const p = document.createElement('p');
      p.className = 'setting-note';
      p.textContent = hasOldSave()
        ? 'Make a profile to keep playing. Your progress from before comes with it.'
        : 'Make a profile to start. Each player gets their own save.';
      list.prepend(p);
    }
    show('profileList');
  }

  function pick(id) {
    picked = id;
    const u = data.users[id];
    $('loginWho').textContent = `Playing as ${u.name}`;
    $('loginPw').hidden = !u.hash;
    $('loginPw').value = '';
    $('loginRemember').checked = false;
    show('loginForm');
    if (u.hash) $('loginPw').focus();
  }

  function openNew() {
    for (const f of ['newName', 'newPw', 'newPw2']) $(f).value = '';
    // The old single save goes to whichever profile asks for it first
    $('newKeepRow').hidden = !hasOldSave();
    $('newKeep').checked = !Object.keys(data.users).length;
    $('newRemember').checked = false;
    show('newForm');
    $('newName').focus();
  }

  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const u = data.users[picked];
    if (!u) return renderList();
    if (!(await checkPw(u, $('loginPw').value))) {
      $('loginPw').value = '';
      return err('Wrong password.');
    }
    enter(picked, $('loginRemember').checked);
  });

  $('newForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('newName').value.trim().replace(/\s+/g, ' ');
    const pw = $('newPw').value;
    if (!NAME_RE.test(name)) return err('Use 1 to 16 letters, numbers, spaces, - or _.');
    const id = idOf(name);
    if (data.users[id]) return err('That name is taken.');
    if (pw !== $('newPw2').value) return err("The passwords don't match.");
    data.users[id] = Object.assign({ name, created: Date.now() }, await makePw(pw));
    if (!$('newKeepRow').hidden && $('newKeep').checked) {
      localStorage.setItem(saveKeyOf(id), localStorage.getItem(OLD_SAVE_KEY));
      localStorage.removeItem(OLD_SAVE_KEY);
    }
    enter(id, $('newRemember').checked);
  });

  for (const b of document.querySelectorAll('.login-back')) b.addEventListener('click', renderList);

  // ---------- Profile buttons in the game ----------
  $('profileBtn').addEventListener('click', logout);
  $('switchProfile').addEventListener('click', logout);

  // One small form for both "change password" and "delete profile"
  let pwMode = null;
  function openPwForm(mode) {
    const u = data.users[PROFILE.id];
    pwMode = mode;
    $('pwForm').hidden = false;
    $('pwOld').hidden = !u.hash;
    $('pwNew').hidden = $('pwNew2').hidden = mode !== 'change';
    for (const f of ['pwOld', 'pwNew', 'pwNew2']) $(f).value = '';
    $('pwSubmit').textContent = mode === 'change' ? 'Save password' : 'Delete forever';
    $('pwSubmit').classList.toggle('danger', mode === 'delete');
    $('pwMsg').textContent = mode === 'change'
      ? 'Leave the new password empty to remove it.'
      : `This deletes ${u.name} and all of their progress. It can't be undone.`;
    (u.hash ? $('pwOld') : mode === 'change' ? $('pwNew') : $('pwSubmit')).focus();
  }
  $('changePw').addEventListener('click', () => openPwForm('change'));
  $('deleteProfile').addEventListener('click', () => openPwForm('delete'));
  $('pwCancel').addEventListener('click', () => { $('pwForm').hidden = true; });

  $('pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = PROFILE.id, u = data.users[id];
    if (!(await checkPw(u, $('pwOld').value))) {
      $('pwOld').value = '';
      return ($('pwMsg').textContent = 'Wrong password.');
    }
    if (pwMode === 'change') {
      if ($('pwNew').value !== $('pwNew2').value) return ($('pwMsg').textContent = "The new passwords don't match.");
      Object.assign(u, await makePw($('pwNew').value));
      Store.set(data);
      $('pwForm').hidden = true;
      $('profileNote').textContent = `Playing as ${u.name}${u.hash ? ' 🔒' : ''}.`;
      if (window.toast) toast(u.hash ? 'Password saved' : 'Password removed', '#7dff9a');
      return;
    }
    resetting = true; // game.js: stops the save-on-close from writing the deleted save back
    localStorage.removeItem(saveKeyOf(id));
    delete data.users[id];
    Store.set(data);
    logout();
  });

  // Straight back in if this tab is logged in, or someone picked "Remember me"
  let who = null;
  try { who = sessionStorage.getItem(SESSION_KEY); } catch (e) { /* blocked */ }
  who = who || data.remember;
  if (who && data.users[who]) start(who);
  else { $('loginScreen').hidden = false; renderList(); }
})();
