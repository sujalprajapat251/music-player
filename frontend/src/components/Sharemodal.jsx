import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, projectId }) => {
  const [shareLink, setShareLink] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [shared, setShared] = useState(false);
  const [invited, setInvited] = useState(false);

  
React.useEffect(() => {
  const origin = window?.location?.origin || '';
  const dynamic = projectId ? `${origin}/sidebar/timeline/${projectId}` : window?.location?.href || origin;
  setShareLink(dynamic);
}, [projectId]);

const handleNativeShare = async () => {
  try {
    console.log(navigator.share)
    if (navigator.share) {
      await navigator.share({
        title: 'Join my Soundtrap project',
        text: 'Check out my music project on Soundtrap!',
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

  const handleInvite = () => {
    if (emailInput.trim()) {
      setInvited(true);
      setTimeout(() => {
        setInvited(false);
        setEmailInput('');
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl bg-[#1F1F1F]">
        {/* Header with close button */}
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Share via link section */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">Share via link</h3>
          <div className="flex gap-2 mb-2">
            <input type="text" value={shareLink} readOnly className="flex-1 text-white px-3 py-2 rounded-[2px] border border-[#7f7b87] focus:outline-none bg-[#1F1F1F]"/>
            <button
              onClick={handleNativeShare}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors rounded-[25px] border border-[#7f7b87] ${
                shared
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1F1F1F] text-white hover:bg-gray-800'
              }`}
            >
              {shared ? <Check size={16} /> : <Share2 size={16} />}
              {shared ? 'Shared!' : 'Share'}
            </button>
          </div>
          <p className="text-gray-300 text-sm">People with this link can directly join and make changes to your project.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#7f7b87] mb-6"></div>

        {/* Add people section */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Add people</h3>
          <div className="mb-2">
            <label className="text-white text-sm block mb-2">Enter names or emails</label>
            <div className="flex gap-2">
              <input type="text" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter names or emails"
                className="flex-1 text-white px-3 py-2 rounded-[2px] border border-[#7f7b87] focus:outline-none placeholder-gray-400 bg-[#1F1F1F]"
              />
              <button
                onClick={handleInvite}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors rounded-[25px] border border-[#7f7b87] ${
                  invited
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1F1F1F] text-white hover:bg-gray-800'
                }`}
              >
                <Check size={16} />
                {invited ? 'Invited!' : 'Invite'}
              </button>
            </div>
          </div>
          <p className="text-gray-300 text-sm">These people can join and make changes to your project.</p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
