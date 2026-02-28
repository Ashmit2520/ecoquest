'use client';

import { useState } from 'react';
import { Quest } from '../data/quests';

interface CompletionModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (note: string, hasPhoto: boolean) => void;
}

export default function CompletionModal({ quest, isOpen, onClose, onComplete }: CompletionModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoFileName, setPhotoFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasPhoto(true);
      setPhotoFileName(file.name);
    }
  };

  const handleSubmit = () => {
    if (confirmed) {
      onComplete(note, hasPhoto);
      // Reset state
      setConfirmed(false);
      setNote('');
      setHasPhoto(false);
      setPhotoFileName('');
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setNote('');
    setHasPhoto(false);
    setPhotoFileName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[scale-in_0.2s_ease-out]">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{quest.icon}</div>
          <h2 className="text-xl font-bold text-gray-900">Complete Quest</h2>
          <p className="text-gray-600 text-sm mt-1">{quest.title}</p>
        </div>

        {/* Confirmation checkbox */}
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                confirmed 
                  ? 'bg-eco-green border-eco-green' 
                  : 'border-gray-300 group-hover:border-eco-green'
              }`}>
                {confirmed && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-gray-700 font-medium">
              I confirm that I have completed this quest and done my part for sustainability! 🌱
            </span>
          </label>
        </div>

        {/* Optional note */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share your experience or tips for others..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-green focus:ring-2 focus:ring-eco-green/20 outline-none resize-none transition-all"
            rows={3}
          />
        </div>

        {/* Photo upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach proof photo (optional)
          </label>
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-eco-green cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            {photoFileName ? (
              <>
                <svg className="w-5 h-5 text-eco-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-eco-green font-medium truncate max-w-[200px]">
                  {photoFileName}
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Click to upload photo</span>
              </>
            )}
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!confirmed}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all ${
              confirmed
                ? 'bg-eco-green hover:bg-eco-green-dark shadow-lg shadow-eco-green/30'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
