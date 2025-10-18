import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useTheme } from '../Utils/ThemeContext';
import { useI18n } from '../Utils/i18n';
import { MdOutlineContentCopy } from 'react-icons/md';
const getModalColors = (isDark) => ({
  overlayBg: 'bg-black bg-opacity-50',

  modalBg: isDark ? '#1F1F1F' : '#ffffff',
  modalText: isDark ? '#ffffff' : '#141414',
  modalSubText: isDark ? '#cccccc' : '#444444',

  inputBg: isDark ? '#1F1F1F' : '#f9f9f9',
  inputText: isDark ? '#ffffff' : '#141414',
  inputBorder: isDark ? '#7f7b87' : '#cdcdcd',
  inputPlaceholder: isDark ? '#a1a1a1' : '#888888',

  divider: isDark ? '#7f7b87' : '#cdcdcd',

  buttonBorder: isDark ? '#7f7b87' : '#cdcdcd',
  buttonBg: isDark ? '#1F1F1F' : '#f9f9f9',
  buttonText: isDark ? '#ffffff' : '#141414',
  buttonHoverBg: isDark ? '#2A2A2A' : '#efefef',

  successBg: '#16a34a', // green-600
  warningText: '#facc15', // yellow-400
});

const ShareModal = ({ isOpen, onClose, projectId }) => {
  const [shareLink, setShareLink] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [shared, setShared] = useState(false);
  const [invited, setInvited] = useState(false);

  const { isDark } = useTheme();
  const { t } = useI18n();
  const colors = getModalColors(isDark);
  useEffect(() => {
      const origin = window?.location?.origin || '';
    const dynamic = projectId ? `${origin}/sidebar/timeline/${projectId}` : window?.location?.href || origin;
    setShareLink(dynamic);
    console.log('ShareModal - projectId:', projectId, 'shareLink:', dynamic);
  }, [projectId]);

  const handleNativeShare = async () => {
    try {
      console.log('Sharing URL:', shareLink);
      if (navigator.share) {
        await navigator.share({
          title: t('joinMyProject'),
          text: t('checkOutProject'),
          url: shareLink,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        await navigator.clipboard.writeText(shareLink);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
        try {
          await navigator.clipboard.writeText(shareLink);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        } catch (clipboardErr) {
          console.error('Failed to copy to clipboard:', clipboardErr);
        }
      }
    }
  };

  // const handleInvite = () => {
  //   if (emailInput.trim()) {
  //     setInvited(true);
  //     setTimeout(() => {
  //       setInvited(false);
  //       setEmailInput('');
  //     }, 2000);
  //   }
  // };

  // const handleKeyPress = (e) => {
  //   if (e.key === 'Enter') {
  //     handleInvite();
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${colors.overlayBg} flex items-center justify-center z-[99] bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in`}>
    <div
      className="rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl"
      style={{ background: colors.modalBg }}
    >
      {/* Header with close button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onClose}
          className="transition-colors"
          style={{ color: colors.modalText }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-6"></div>

      {/* Share via link */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: colors.modalText }}
        >
          {t('shareViaLink')}
        </h3>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 rounded-[2px] focus:outline-none"
                style={{
                  background: colors.inputBg,
                  color: colors.inputText,
                  border: `1px solid ${colors.inputBorder}`,
                }}
              />
              <button
            onClick={handleNativeShare}
            className="px-4 py-2 rounded-[25px] flex items-center gap-2 transition-colors border"
                style={{
                  borderColor: colors.buttonBorder,
                  background: shared ? colors.successBg : colors.buttonBg,
                  color: colors.buttonText,
                }}
              >
                {shared ? <Check size={16} /> : <MdOutlineContentCopy size={16} />}
                {shared ? t('Copied') : t('Copy')}
              </button>
            </div>

            <p style={{ color: colors.modalSubText }} className="text-sm">
          {t('peopleCanJoin')}
                </p>
            {!projectId && (
              <p style={{ color: colors.warningText }} className="text-xs mt-1">
                ⚠️ {t('noProjectId')}
              </p>
        )}
      </div>

      {/* Divider */}
      {/* <div className="mb-6" style={{ borderTop: `1px solid ${colors.divider}` }}></div> */}

      {/* Add people */}
      {/* <div>
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: colors.modalText }}
        >
          Add people
        </h3>

        <div className="mb-2">
          <label
            className="text-sm block mb-2"
            style={{ color: colors.modalText }}
          >
            Enter names or emails
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter names or emails"
              className="flex-1 px-3 py-2 rounded-[2px] focus:outline-none"
              style={{
                background: colors.inputBg,
                color: colors.inputText,
                border: `1px solid ${colors.inputBorder}`,
                '::placeholder': { color: colors.inputPlaceholder },
              }}
            />
            <button
              onClick={handleInvite}
              className="px-4 py-2 rounded-[25px] flex items-center gap-2 transition-colors border"
              style={{
                borderColor: colors.buttonBorder,
                background: invited ? colors.successBg : colors.buttonBg,
                color: colors.buttonText,
              }}
            >
              <Check size={16} />
              {invited ? 'Invited!' : 'Invite'}
            </button>
          </div>
        </div>

        <p style={{ color: colors.modalSubText }} className="text-sm">
          These people can join and make changes to your project.
        </p>
      </div> */}
    </div>
  </div>
  );
};

export default ShareModal;
