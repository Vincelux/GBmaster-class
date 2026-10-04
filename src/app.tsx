import { useEffect, useState } from 'preact/hooks';
import type { Mode, Pack } from './types';
import {
  currentLocalProfile, listLocalProfiles, setCurrentLocalProfile, updateLocalProfile, type LocalProfile,
} from './accounts';
import { adoptLegacyData, setNamespace, wipe } from './store';
import { createProfile, getProfile } from './profile';
import type { Cefr } from './cefr';
import { Session } from './screens/session';
import { Settings } from './screens/settings';
import { Home, PackScreen, withScope, type Scope } from './screens/home';
import { PlayerPicker } from './screens/players';
import { Onboarding } from './screens/onboarding';
import { ProfileScreen } from './screens/profile';
import { Toasts } from './screens/toasts';

type View =
  | { name: 'home' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'pack'; pack: Pack }
  | { name: 'session'; pack: Pack; mode: Mode; scope: Scope };

type Phase = 'pick' | 'onboarding' | 'app';

export function App() {
  const [phase, setPhase] = useState<Phase>('pick');
  const [view, setView] = useState<View>({ name: 'home' });
  const [player, setPlayer] = useState<LocalProfile | null>(null);

  /* Open a player's data, then decide between level selection and the app. */
  const enter = (p: LocalProfile, fresh = false) => {
    setNamespace(p.id);
    if (fresh && listLocalProfiles().length === 1) adoptLegacyData();
    setCurrentLocalProfile(p.id);
    setPlayer(p);
    setView({ name: 'home' });
    setPhase(getProfile() ? 'app' : 'onboarding');
  };

  // Resume the last player on launch.
  useEffect(() => {
    const p = currentLocalProfile();
    if (p) enter(p);
  }, []);

  const switchPlayer = () => {
    setCurrentLocalProfile(null);
    setNamespace('guest');
    setPlayer(null);
    setView({ name: 'home' });
    setPhase('pick');
  };

  const resetProgress = () => {
    wipe();
    setView({ name: 'home' });
    setPhase('onboarding');
  };

  const finishOnboarding = (level: Cefr) => {
    createProfile(player!.name, level);
    setView({ name: 'home' });
    setPhase('app');
  };

  let screen;
  if (phase === 'pick' || !player) {
    screen = <PlayerPicker onPick={(p) => enter(p)} onCreate={(p) => enter(p, true)} />;
  } else if (phase === 'onboarding') {
    screen = <Onboarding name={player.name} onDone={finishOnboarding} />;
  } else if (view.name === 'session') {
    screen = (
      <Session
        pack={withScope(view.pack, view.scope, getProfile()!.cefr)}
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
        player={player}
        onBack={() => setView({ name: 'home' })}
        onSettings={() => setView({ name: 'settings' })}
        onSwitch={switchPlayer}
        onReset={resetProgress}
        onEdit={(patch) => {
          updateLocalProfile(player.id, patch);
          setPlayer({ ...player, ...patch });
        }}
      />
    );
  } else {
    screen = (
      <Home
        player={player}
        onOpenPack={(pack) => setView({ name: 'pack', pack })}
        onProfile={() => setView({ name: 'profile' })}
        onSettings={() => setView({ name: 'settings' })}
        onSwitch={switchPlayer}
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
