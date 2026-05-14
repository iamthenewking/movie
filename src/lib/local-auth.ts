export type LocalAuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type LocalAuthAccount = LocalAuthUser & {
  password: string;
};

const STORAGE_KEYS = {
  accounts: 'movieko:auth:accounts',
  session: 'movieko:auth:session',
} as const;

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function withoutPassword(account: LocalAuthAccount): LocalAuthUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };
}

function getAccounts() {
  return readJson<LocalAuthAccount[]>(STORAGE_KEYS.accounts, []);
}

function setAccounts(accounts: LocalAuthAccount[]) {
  writeJson(STORAGE_KEYS.accounts, accounts);
}

export function getCurrentUser() {
  const session = readJson<{ userId: string | null } | null>(
    STORAGE_KEYS.session,
    null,
  );

  if (!session?.userId) {
    return null;
  }

  const account = getAccounts().find((item) => item.id === session.userId);
  return account ? withoutPassword(account) : null;
}

function setCurrentUser(user: LocalAuthUser | null) {
  if (!canUseStorage()) {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    return;
  }

  writeJson(STORAGE_KEYS.session, { userId: user.id });
}

function buildUserId() {
  return `user_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(
    36,
  )}`;
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = sanitizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (name.length < 2) {
    throw new Error('Use a name with at least 2 characters.');
  }

  if (!email.includes('@')) {
    throw new Error('Enter a valid email address.');
  }

  if (password.length < 6) {
    throw new Error('Use a password with at least 6 characters.');
  }

  const accounts = getAccounts();
  if (accounts.some((item) => item.email === email)) {
    throw new Error('That email is already registered.');
  }

  const account: LocalAuthAccount = {
    id: buildUserId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  const nextAccounts = [account, ...accounts];
  setAccounts(nextAccounts);
  const user = withoutPassword(account);
  setCurrentUser(user);
  return user;
}

export function loginUser(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const account = getAccounts().find(
    (item) => item.email === email && item.password === password,
  );

  if (!account) {
    throw new Error('Incorrect email or password.');
  }

  const user = withoutPassword(account);
  setCurrentUser(user);
  return user;
}

export function logoutUser() {
  setCurrentUser(null);
}
