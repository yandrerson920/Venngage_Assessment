import React, { useState, useCallback, memo } from 'react';
import { Icon } from '../types';

interface IconGridProps {
  icons: Icon[];
  metadata: any;
}

// Memoized Icon Card Component
const IconCard = memo(({ icon, onDownload }: { icon: Icon; onDownload: (icon: Icon) => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="icon-card">
      <div className="icon-image-container">
        {!imageLoaded && (
          <div className="spinner" style={{ width: '32px', height: '32px', margin: 'auto' }} />
        )}
        <img 
          src={icon.url} 
          alt={`Icon ${icon.id}`}
          className="icon-image"
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      <div className="icon-footer">
        <span className="icon-number">Icon {icon.id}</span>
        <button
          onClick={() => onDownload(icon)}
          className="download-btn"
          title="Download this icon"
        >
          💾
        </button>
      </div>
    </div>
  );
});

IconCard.displayName = 'IconCard';

const IconGrid: React.FC<IconGridProps> = ({ icons, metadata }) => {
  const [downloadingAll, setDownloadingAll] = useState(false);

  const downloadIcon = useCallback(async (icon: Icon) => {
    try {
      const response = await fetch(icon.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `icon-${metadata?.style || 'custom'}-${icon.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading icon:', error);
      alert('Failed to download icon. Please try again.');
    }
  }, [metadata?.style]);

  const downloadAllIcons = useCallback(async () => {
    setDownloadingAll(true);
    try {
      for (const icon of icons) {
        await downloadIcon(icon);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error downloading all icons:', error);
    } finally {
      setDownloadingAll(false);
    }
  }, [icons, downloadIcon]);

  return (
    <div className="card icon-grid-container">
      {/* Header */}
      <div className="grid-header">
        <div>
          <h2 className="grid-title">
            Your Icon Set
          </h2>
          <p className="grid-subtitle">
            {metadata?.prompt} • {metadata?.style} style
            {metadata?.colors && metadata.colors.length > 0 && (
              <span> • Custom colors</span>
            )}
          </p>
        </div>
        <button
          onClick={downloadAllIcons}
          disabled={downloadingAll}
          className="download-all-btn"
        >
          {downloadingAll ? '⏳ Downloading...' : '📥 Download All'}
        </button>
      </div>

      {/* Icon Grid */}
      <div className="icon-grid">
        {icons.map((icon) => (
          <IconCard key={icon.id} icon={icon} onDownload={downloadIcon} />
        ))}
      </div>

      {/* Usage Note */}
      <div className="usage-note">
        <p>
          <strong>💡 Tip:</strong> Icons are generated at 512×512 pixels in PNG format.
          You can use them in your designs, presentations, or applications.
        </p>
      </div>
    </div>
  );
};

export default memo(IconGrid);
