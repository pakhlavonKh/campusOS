import React from 'react';

interface Props {
  lang: 'en' | 'ru' | 'uz';
  onChange: (lang: 'en' | 'ru' | 'uz') => void;
}

export function LangSwitcher({ lang, onChange }: Props) {
  return (
    <div className="lang-switcher">
      {(['en', 'ru', 'uz'] as const).map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-btn${lang === l ? ' active' : ''}`}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
