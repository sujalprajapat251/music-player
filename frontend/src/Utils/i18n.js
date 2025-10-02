// Minimal i18n context for language selection and translation
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const I18nContext = createContext({
  language: 'English',
  setLanguage: () => {},
  t: (key) => key,
});

// Basic translations; extend as needed
const translations = {
  English: {
    file: 'File',
    edit: 'Edit',
    settings: 'Setting',
    new: 'New...',
    open: 'Open...',
    openRecent: 'Open Recent',
    previousVersions: 'Previous versions',
    export: 'Export',
    shareProject: 'Share Project',
    goToProfile: 'Go to profile',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    delete: 'Delete',
    effects: 'Effects',
    createRegion: 'Create region',
    midiSettings: 'MIDI Settings...',
    tuner: 'Tuner',
    keyboard: 'Keyboard',
    musicalTyping: 'Musical Typing',
    lowLatency: 'Low latency...',
    songSections: 'Song Sections',
    language: 'Language',
    themes: 'Themes',
    exportBtn: 'Export',
    upgradeNow: 'Upgrade Now',
    share: 'Share',
    exit: 'Exit',
  },
  Deutsch: {
    file: 'Datei',
    edit: 'Bearbeiten',
    settings: 'Einstellung',
    new: 'Neu...',
    open: 'Öffnen...',
    openRecent: 'Zuletzt geöffnet',
    previousVersions: 'Frühere Versionen',
    export: 'Exportieren',
    shareProject: 'Projekt teilen',
    goToProfile: 'Zum Profil',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    paste: 'Einfügen',
    delete: 'Löschen',
    effects: 'Effekte',
    createRegion: 'Region erstellen',
    midiSettings: 'MIDI-Einstellungen...',
    tuner: 'Stimmgerät',
    keyboard: 'Tastatur',
    musicalTyping: 'Musikalisches Tippen',
    lowLatency: 'Niedrige Latenz...',
    songSections: 'Songabschnitte',
    language: 'Sprache',
    themes: 'Themen',
    exportBtn: 'Exportieren',
    upgradeNow: 'Jetzt upgraden',
    share: 'Teilen',
    exit: 'Beenden',
  },
  Español: {
    file: 'Archivo',
    edit: 'Editar',
    settings: 'Ajuste',
    new: 'Nuevo...',
    open: 'Abrir...',
    openRecent: 'Abrir reciente',
    previousVersions: 'Versiones anteriores',
    export: 'Exportar',
    shareProject: 'Compartir proyecto',
    goToProfile: 'Ir al perfil',
    undo: 'Deshacer',
    redo: 'Rehacer',
    cut: 'Cortar',
    copy: 'Copiar',
    paste: 'Pegar',
    delete: 'Eliminar',
    effects: 'Efectos',
    createRegion: 'Crear región',
    midiSettings: 'Ajustes MIDI...',
    tuner: 'Afinador',
    keyboard: 'Teclado',
    musicalTyping: 'Escritura musical',
    lowLatency: 'Baja latencia...',
    songSections: 'Secciones de la canción',
    language: 'Idioma',
    themes: 'Temas',
    exportBtn: 'Exportar',
    upgradeNow: 'Actualizar ahora',
    share: 'Compartir',
    exit: 'Salir',
  },
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const setLang = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('appLanguage', lang);
    } catch (_) {}
  };

  const t = useMemo(() => {
    const dict = translations[language] || translations.English;
    return (key) => (dict[key] != null ? dict[key] : key);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage: setLang, t }), [language, t]);
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);


