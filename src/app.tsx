import { useEffect, useState } from 'preact/hooks';
import type { Mode, Pack } from './types';
import { getCloudBackend, type CloudBackend, type CloudUser } from './backend';
import {
  currentLocalProfile, listLocalProfiles,
  renameLocalProfile, setCurrentLocalProfile, type LocalProfile,
} from './accounts';
import { adoptLegacyData, has, setNamespace, wipe } from './store';
import { createProfile, getProfile } from './profile';
import { flushSync, startSync, stopSync } from './sync';
import type { Cefr } from './cefr';
import { Session } from './screens/session';
import { Settings } from './screens/settings';
import { Home, PackScreen, withScope, type Scope } from './screens/home';
import { AuthScreen, LocalPicker, RecoveryScreen } from './screens/auth';
import { Onboarding } from './screens/onboarding';
import { ProfileScreen } from './screens/profile';
import { Toasts } from './screens/toasts';

type View =
  | { name: 'home' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'pack'; pack: Pack }
  | { name: 'session'; pack: Pack; mode: Mode; scope: Scope };

type Phase = 'boot' | 'auth' | 'recovery' | 'pick' | 'onboarding' | 'app';

export function App() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [view, setView] = useState<View>({ name: 'home' });
  const [cloud, setCloud] = useState<CloudBackend | null>(null);
  const [user, setUser] = useState<CloudUser | null>(null);
  const [local, setLocal] = useState<LocalProfile | null>(null);

  /* Open a user's data, then decide between onboarding and the app. */
  const enterCloud = async (b: CloudBackend, u: CloudUser) => {
    setNamespace(u.id);
    if (!has('profile') && !has('progress')) adoptLegacyData();
    await startSync(b, u);
    setUser(u);
    setView({ name: 'home' });
    setPhase(getProfile() ? 'app' : 'onboarding');
  };

  const enterLocal = (p: LocalProfile, fresh = false) => {
    setNamespace(p.id);
    if (fresh && listLocalProfiles().length === 1) adoptLegacyData();
    setCurrentLocalProfile(p.id);
    setLocal(p);
    setView({ name: 'home' });
    setPhase(getProfile() ? 'app' : 'onboarding');
  };

  useEffect(() => {
    (async () => {
      const b = await getCloudBackend();
      setCloud(b);
      if (b) {
        b.onRecovery(() => setPhase('recovery'));
        const u = await b.init();
        if (u) await enterCloud(b, u);
        else setPhase('auth');
      } else {
        const id = currentLocalProfile();
        const p = listLocalProfiles().find((x) => x.id === id);
        if (p) enterLocal(p);
        else setPhase('pick');
      }
    })();
  }, []);

  const signOut = async () => {
    if (cloud) {
      await flushSync();
      stopSync();
      await cloud.signOut();
      setNamespace('guest');
      setUser(null);
      setPhase('auth');
    } else {
      setCurrentLocalProfile(null);
      setNamespace('guest');
      setLocal(null);
      setPhase('pick');
    }
  };

  const resetProgress = () => {
    wipe();
    setView({ name: 'home' });
    setPhase('onboarding');
  };

  const finishOnboarding = (name: string, level: Cefr) => {
    createProfile(name, level);
    if (local) renameLocalProfile(local.id, name.trim());
    setView({ name: 'home' });
    setPhase('app');
  };

  let screen;
  if (phase === 'boot') {
    screen = <main class="screen center"><span class="badge big">GB</span></main>;
  } else if (phase === 'auth' && cloud) {
    screen = <AuthScreen backend={cloud} onUser={(u) => void enterCloud(cloud, u)} />;
  } else if (phase === 'recovery' && cloud) {
    screen = <RecoveryScreen backend={cloud} onDone={() => setPhase('auth')} />;
  } else if (phase === 'pick') {
    screen = <LocalPicker onPick={(p) => enterLocal(p)} onCreate={(p) => enterLocal(p, true)} />;
  } else if (phase === 'onboarding') {
    screen = (
      <Onboarding
        initialName={local?.name ?? user?.email.split('@')[0] ?? ''}
        onDone={finishOnboarding}
      />
    );
  } else if (view.name === 'session') {
    const mine = getProfile()!.cefr;
    screen = (
      <Session
        pack={withScope(view.pack, view.scope, mine)}
        mode={view.mode}
        onExit={() => setView({ name: 'pack', pack: view.pack })}
      />
    );
  } else if (view.name === 'pack') {
    screen = (
      <PackScreen
        pack={view.pack}
        onBack={() => setView({ name: 'home' })}
        onStart={(mode, scope) => setView({ name: 'session', pack: view.pack, mode, scope })}
      />
    );
  } else if (view.name === 'settings') {
    screen = <Settings onBack={() => setView({ name: 'home' })} />;
  } else if (view.name === 'profile') {
    screen = (
      <ProfileScreen
        mode={cloud ? 'cloud' : 'local'}
        email={user?.email}
        onBack={() => setView({ name: 'home' })}
        onSettings={() => setView({ name: 'settings' })}
        onSignOut={() => void signOut()}
        onReset={resetProgress}
        onRename={(n) => local && renameLocalProfile(local.id, n)}
      />
    );
  } else {
    screen = (
      <Home
        onOpenPack={(pack) => setView({ name: 'pack', pack })}
        onProfile={() => setView({ name: 'profile' })}
        onSettings={() => setView({ name: 'settings' })}
      />
    );
  }

  return (
    <>
      {screen}
      <Toasts />
    </>
  );
}

