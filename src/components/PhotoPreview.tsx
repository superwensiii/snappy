import { useState, useRef, useEffect } from "react";
import { ArrowLeft, RotateCcw, Download, Eye, Palette, Sticker, Calendar, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PhotoPreviewProps {
  photos: string[];
  layout: string;
  onRetake: () => void;
  onDownload: () => void;
  onBack: () => void;
}

const stickerImages = [
  "/stickers/meow1.png",
  "/stickers/meow2.png",
  "/stickers/meow3.png",
  "/stickers/meow4.png",
  "/stickers/meow5.png",
  "/stickers/meow6.png",
  "/stickers/meow7.png",
  "/stickers/meow8.png",
];

interface BackgroundTemplate {
  path: string;
  name: string;
  fixedStickers: {
    image: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

const backgroundTemplates: BackgroundTemplate[] = [
  {
    path: "/backgrounds/desgn.jpg",
    name: "Design 1",
    fixedStickers: [
      { image: "/stickers/fly.png", x: 5, y: 5, width: 70, height: 70 },
      { image: "/stickers/ce.png", x: 95, y: 95, width: 70, height: 70 }
    ]
  },
  {
    path: "/backgrounds/lilies.jpg",
    name: "Design 2",
    fixedStickers: [
      { image: "/stickers/li.png", x: 5, y: 5, width: 70, height: 70 },
      { image: "/stickers/le.png", x: 95, y: 95, width: 70, height: 70 }
    ]
  },
  {
    path: "/backgrounds/baclkk.jpg",
    name: "Design 3",
    fixedStickers: [
      { image: "/stickers/ios___-removebg-preview.png", x: 5, y: 5, width: 100, height: 100 },
      { image: "/stickers/widget____-removebg-preview.png", x: 95, y: 95, width: 100, height: 100 }
    ]
  },
  {
    path: "/backgrounds/cam.jpg",
    name: "Design 4",
    fixedStickers: [
      { image: "/stickers/cam.png", x: 5, y: 5, width: 100, height: 100 },
      { image: "/stickers/strawberry_sonny_angel-removebg-preview.png", x: 95, y: 95, width: 100, height: 100 }
    ]
  },
  {
    path: "/backgrounds/blue.jpg",
    name: "Design 5",
    fixedStickers: [
      { image: "/stickers/ribon.png", x: 5, y: 5, width: 100, height: 100 },
      { image: "/stickers/posa.png", x: 95, y: 95, width: 100, height: 100 }
    ]
  }
];

const colors = [
  "#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db",
  "#9ca3af", "#6b7280", "#374151", "#111827",
  "#fef3c7", "#fde68a", "#fbbf24", "#f59e0b",
  "#fce7f3", "#fbcfe8", "#f9a8d4", "#ec4899",
  "#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6",
  "#d1fae5", "#86efac", "#4ade80", "#16a34a"
];

interface StickerPosition {
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const PhotoPreview = ({ photos, layout, onRetake, onDownload: parentOnDownload, onBack }: PhotoPreviewProps) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<{[key: number]: StickerPosition[]}>({});
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [selectedTemplate, setSelectedTemplate] = useState<BackgroundTemplate | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSticker, setActiveSticker] = useState<{photoIndex: number, stickerIndex: number, type: 'move' | 'resize'} | null>(null);
  const [startPos, setStartPos] = useState({x: 0, y: 0});
  const [selectedStickerIndex, setSelectedStickerIndex] = useState<{photoIndex: number, stickerIndex: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Updated layout config to match preview dimensions
  const layoutConfig = {
    "2x6": { 
      photos: 2, 
      width: 400, 
      height: 770,
      photoHeight: 300,
      photoWidth: 360,
      padding: 20,
      gap: 20
    },
    "3x4": { 
      photos: 3, 
      width: 400, 
      height: 1250,
      photoHeight: 360,
      photoWidth: 360,
      padding: 20,
      gap: 20
    },
    "4x6": { 
      photos: 4, 
      width: 400, 
      height: 1650,
      photoHeight: 360,
      photoWidth: 360,
      padding: 20,
      gap: 20
    },
  };

  const config = layoutConfig[layout as keyof typeof layoutConfig];


  const addSticker = (photoIndex: number, stickerImage: string) => {
    setSelectedStickers(prev => ({
      ...prev,
      [photoIndex]: [...(prev[photoIndex] || []), {
        image: stickerImage,
        x: 30,
        y: 30,
        width: 50,
        height: 50
      }]
    }));
    setSelectedStickerIndex({
      photoIndex,
      stickerIndex: (selectedStickers[photoIndex]?.length || 0)
    });
  };

  const removeSticker = (photoIndex: number, stickerIndex: number) => {
    setSelectedStickers(prev => {
      const updated = {...prev};
      if (updated[photoIndex]) {
        updated[photoIndex] = updated[photoIndex].filter((_, i) => i !== stickerIndex);
        if (updated[photoIndex].length === 0) {
          delete updated[photoIndex];
        }
      }
      return updated;
    });
    setSelectedStickerIndex(null);
  };

  const handleStickerStart = (
    clientX: number,
    clientY: number,
    photoIndex: number,
    stickerIndex: number,
    type: 'move' | 'resize' = 'move'
  ) => {
    setActiveSticker({photoIndex, stickerIndex, type});
    setStartPos({x: clientX, y: clientY});
    setSelectedStickerIndex({photoIndex, stickerIndex});
    document.body.style.cursor = type === 'move' ? "grabbing" : "nwse-resize";
  };

  const handleStickerMouseDown = (
    e: React.MouseEvent,
    photoIndex: number,
    stickerIndex: number,
    type: 'move' | 'resize' = 'move'
  ) => {
    e.stopPropagation();
    handleStickerStart(e.clientX, e.clientY, photoIndex, stickerIndex, type);
  };

  const handleStickerTouchStart = (
    e: React.TouchEvent,
    photoIndex: number,
    stickerIndex: number,
    type: 'move' | 'resize' = 'move'
  ) => {
    e.stopPropagation();
    const touch = e.touches[0];
    handleStickerStart(touch.clientX, touch.clientY, photoIndex, stickerIndex, type);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!activeSticker || !containerRef.current) return;
    
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = containerRect.width / 100;
    const scaleY = containerRect.height / 100;

    setSelectedStickers(prev => {
      const updated = {...prev};
      const stickers = [...updated[activeSticker.photoIndex]];
      const sticker = {...stickers[activeSticker.stickerIndex]};
      
      if (activeSticker.type === 'move') {
        sticker.x = Math.max(5, Math.min(95, sticker.x + dx/scaleX));
        sticker.y = Math.max(5, Math.min(95, sticker.y + dy/scaleY));
      } else {
        const newWidth = Math.max(30, Math.min(200, sticker.width + dx));
        const ratio = sticker.height / sticker.width;
        sticker.width = newWidth;
        sticker.height = newWidth * ratio;
      }
      
      stickers[activeSticker.stickerIndex] = sticker;
      updated[activeSticker.photoIndex] = stickers;
      
      return updated;
    });

    setStartPos({x: clientX, y: clientY});
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    e.preventDefault();
  };

  const handleEnd = () => {
    setActiveSticker(null);
    document.body.style.cursor = "";
  };

  const handleClickOutside = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) return;
    if ((e.target as HTMLElement).closest('.sticker-container')) return;
    setSelectedStickerIndex(null);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const downloadPhotos = async () => {
    setIsDownloading(true);
    try {
      // Create a canvas with the exact same dimensions as our preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas to exact preview dimensions
      canvas.width = config.width;
      canvas.height = config.height;

      // Draw background (image or color)
      if (selectedTemplate) {
        const bgImg = await loadImage(selectedTemplate.path);
        // Draw background to cover entire canvas
        ctx.drawImage(bgImg, 0, 0, config.width, config.height);
        
        // Draw fixed stickers at exact positions
        for (const sticker of selectedTemplate.fixedStickers) {
          const stickerImg = await loadImage(sticker.image);
          const x = (config.width * sticker.x / 100) - (sticker.width / 2);
          const y = (config.height * sticker.y / 100) - (sticker.height / 2);
          ctx.drawImage(stickerImg, x, y, sticker.width, sticker.height);
        }
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, config.width, config.height);
      }

      // Draw each photo with exact same dimensions and positions as preview
      for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i]);
        const yPos = i * (config.photoHeight + config.gap) + config.padding;
        
        // Draw photo with same dimensions as preview
        ctx.drawImage(
          img, 
          config.padding, 
          yPos, 
          config.photoWidth, 
          config.photoHeight
        );
        
        // Draw stickers for this photo at exact positions
        if (selectedStickers[i]) {
          for (const sticker of selectedStickers[i]) {
            const stickerImg = await loadImage(sticker.image);
            const x = config.padding + (config.photoWidth * sticker.x / 100) - (sticker.width / 2);
            const y = yPos + (config.photoHeight * sticker.y / 100) - (sticker.height / 2);
            ctx.drawImage(stickerImg, x, y, sticker.width, sticker.height);
          }
        }
      }

      // Draw date and logo at exact same positions
      if (showDate) {
        const today = new Date().toLocaleDateString();
        ctx.fillStyle = selectedTemplate ? 'white' : 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(today, config.width / 2, config.height - 30);
      }

      if (showLogo) {
        ctx.fillStyle = selectedTemplate ? 'white' : 'black';
        ctx.font = 'bold 24px "Allura", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('quick snap!', config.width / 2, config.height - 10);
      }

      // Trigger download
      const link = document.createElement('a');
      link.download = `snappy-${layout}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating photo strip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePhotoStrip = () => {
    const today = new Date().toLocaleDateString();
    
    return (
      <div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-lg relative mx-auto"
        style={{ 
          width: `${config.width}px`,
          height: `${config.height}px`,
          backgroundColor: selectedTemplate ? 'transparent' : backgroundColor,
          backgroundImage: selectedTemplate ? `url(${selectedTemplate.path})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: `${config.padding}px`
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onClick={handleClickOutside}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        <div className="flex flex-col" style={{ gap: `${config.gap}px` }}>
          {photos.map((photo, photoIndex) => (
            <div 
              key={photoIndex} 
              className="relative"
              style={{
                width: `${config.photoWidth}px`,
                height: `${config.photoHeight}px`
              }}
            >
              <img
                src={photo}
                alt={`Photo ${photoIndex + 1}`}
                className="w-full h-full object-cover rounded border-2 border-gray-200"
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
              
              {/* Fixed template stickers */}
              {selectedTemplate?.fixedStickers.map((sticker, index) => (
                <div
                  key={`fixed-${index}`}
                  className="absolute"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    width: `${sticker.width}px`,
                    height: `${sticker.height}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5
                  }}
                >
                  <img
                    src={sticker.image}
                    alt="Fixed sticker"
                    className="w-full h-full"
                  />
                </div>
              ))}

              {/* User-added stickers */}
              {selectedStickers[photoIndex]?.map((sticker, stickerIndex) => {
                const isSelected = selectedStickerIndex?.photoIndex === photoIndex && 
                                 selectedStickerIndex?.stickerIndex === stickerIndex;
                return (
                  <div
                    key={stickerIndex}
                    className="absolute sticker-container"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      width: `${sticker.width}px`,
                      height: `${sticker.height}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                      touchAction: 'none'
                    }}
                  >
                    <img
                      src={sticker.image}
                      alt="Sticker"
                      className="w-full h-full cursor-move"
                      onMouseDown={(e) => handleStickerMouseDown(e, photoIndex, stickerIndex)}
                      onTouchStart={(e) => handleStickerTouchStart(e, photoIndex, stickerIndex)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStickerIndex({photoIndex, stickerIndex});
                      }}
                    />
                    {isSelected && (
                      <>
                        <div
                          className="absolute -right-2 -bottom-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize"
                          onMouseDown={(e) => handleStickerMouseDown(e, photoIndex, stickerIndex, 'resize')}
                          onTouchStart={(e) => handleStickerTouchStart(e, photoIndex, stickerIndex, 'resize')}
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSticker(photoIndex, stickerIndex);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center">
          {showDate && <p className="text-xs" style={{ color: selectedTemplate ? 'white' : 'gray' }}>{today}</p>}
          {showLogo && (
            <span 
              className="text-2xl font-bold" 
              style={{ 
                fontFamily: "'Allura', cursive",
                color: selectedTemplate ? 'white' : 'black'
              }}
            >
              quick snap
            </span>
          )}
        </div>
      </div>
    );
  };

  if (editMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" onClick={() => setEditMode(false)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Allura', cursive" }}>Edit Photos</h2>
          <Button onClick={downloadPhotos} variant="ghost" disabled={isDownloading}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview</h3>
              <div className="flex justify-center">
                {generatePhotoStrip()}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-date">Add date</Label>
                    <Switch id="add-date" checked={showDate} onCheckedChange={setShowDate} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-logo">Add logo</Label>
                    <Switch id="add-logo" checked={showLogo} onCheckedChange={setShowLogo} />
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Background Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`p-2 rounded transition-colors ${!selectedTemplate ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-full h-16 rounded border"
                        style={{ backgroundColor }}
                      />
                      <span className="text-xs mt-1">Plain</span>
                    </div>
                  </button>
                  {backgroundTemplates.map((template, index) => (
                    <button
                      key={index}
                      className={`p-2 rounded transition-colors ${selectedTemplate?.path === template.path ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex flex-col items-center">
                        <img 
                          src={template.path} 
                          alt={template.name} 
                          className="w-full h-16 rounded object-cover"
                        />
                        <span className="text-xs mt-1">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Background Color
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                        backgroundColor === color ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setBackgroundColor(color);
                        setSelectedTemplate(null);
                      }}
                    />
                  ))}
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Sticker className="w-4 h-4" />
                  Stickers
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {stickerImages.map((sticker, index) => (
                    <button
                      key={index}
                      className="p-2 hover:bg-muted rounded transition-colors flex items-center justify-center"
                      onClick={() => addSticker(0, sticker)}
                    >
                      <img 
                        src={sticker} 
                        alt={`Sticker ${index}`} 
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-6xl md:text-7xl font-bold text-primary" style={{ fontFamily: "'Allura', cursive" }}>
          snappy
        </h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
        <div className="flex justify-center">
          {generatePhotoStrip()}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button onClick={onRetake} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
          <Button onClick={() => setEditMode(true)} variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <Button 
          onClick={downloadPhotos} 
          className="w-full max-w-sm" 
          size="lg"
          disabled={isDownloading}
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? "Downloading..." : "Download Photos"}
        </Button>
      </div>
    </div>
  );
};

export default PhotoPreview;


