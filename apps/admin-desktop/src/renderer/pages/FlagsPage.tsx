import React from 'react';
import { Flag } from 'lucide-react';

interface Flags {
  enableAIModule: boolean;
  enableRLSPolicies: boolean;
  maintenanceMode: boolean;
  enableSpeechScoring: boolean;
}

interface Props {
  flags: Flags;
  onToggle: (key: keyof Flags) => void;
  t: (key: string) => string;
}

interface FlagRow {
  key: keyof Flags;
  titleKey: string;
  descKey: string;
}

const FLAG_ROWS: FlagRow[] = [
  { key: 'enableRLSPolicies',  titleKey: 'rlsTitle',         descKey: 'rlsDesc' },
  { key: 'enableSpeechScoring',titleKey: 'aiTitle',          descKey: 'aiDesc' },
  { key: 'enableAIModule',     titleKey: 'genAiTitle',       descKey: 'genAiDesc' },
  { key: 'maintenanceMode',    titleKey: 'maintenanceTitle', descKey: 'maintenanceDesc' },
];

export function FlagsPage({ flags, onToggle, t }: Props) {
  return (
    <div className="card">
      <h2 className="card-title">
        <Flag size={20} color="var(--color-primary)" aria-hidden />
        {t('globalSystemOverrides')}
      </h2>
      <p className="card-desc">{t('globalOverridesDesc')}</p>

      {FLAG_ROWS.map(({ key, titleKey, descKey }) => (
        <div className="toggle-row" key={key}>
          <div className="toggle-info">
            <h4>{t(titleKey)}</h4>
            <p>{t(descKey)}</p>
          </div>
          <label className="switch" htmlFor={`flag-${key}`}>
            <input
              id={`flag-${key}`}
              type="checkbox"
              checked={flags[key]}
              onChange={() => onToggle(key)}
              aria-label={t(titleKey)}
            />
            <span className="switch-track" />
          </label>
        </div>
      ))}
    </div>
  );
}
