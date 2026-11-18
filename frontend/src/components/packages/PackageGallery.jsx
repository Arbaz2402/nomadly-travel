import React from 'react';

export const PackageGallery = ({
  photos = [],
  activePhotoIdx = 0,
  setActivePhotoIdx,
  title = '',
  discountPercent = 0,
}) => {
  const activePhoto = photos[activePhotoIdx] || photos[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
      {/* Main Large Display Image */}
      <div className="lg:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-ink-900 border border-white/10 shadow-2xl group">
        <img
          src={activePhoto}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none" />

        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-500 text-ink-950 text-xs font-black shadow-lg">
            {discountPercent}% COMBO SAVINGS
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white text-xs pointer-events-none">
          <span className="bg-ink-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 inline-block font-semibold">
            Photo {activePhotoIdx + 1} of {photos.length}
          </span>
        </div>
      </div>

      {/* Thumbnails Column */}
      <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[460px] scrollbar-none">
        {photos.map((photo, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePhotoIdx(idx)}
            className={`relative flex-shrink-0 w-28 lg:w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all ${
              activePhotoIdx === idx
                ? 'border-teal-400 ring-2 ring-teal-400/30'
                : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
            }`}
          >
            <img
              src={photo}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
