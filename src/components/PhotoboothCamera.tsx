import { useState, useRef, useEffect } from "react";
import { Camera, RotateCcw, Play, Pause, Download, Eye, Settings, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LayoutSelector from "./LayoutSelector";
import PhotoPreview from "./PhotoPreview";

interface PhotoboothCameraProps {
  onBack: () => void;
}

const TIMER_OPTIONS = [
  { value: "3", label: "3 seconds" },
  { value: "5", label: "5 seconds" },
  { value: "10", label: "10 seconds" },
];

const FILTER_OPTIONS = [
  { value: "none", label: "No Filter" },
  { value: "bw", label: "Black & White" },
  { value: "sepia", label: "Sepia" },
  { value: "vintage", label: "Vintage" },
];

const PhotoboothCamera = ({ onBack }: PhotoboothCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentStep, setCurrentStep] = useState<"layout" | "timer" | "filter" | "capture" | "preview">("layout");
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [timer, setTimer] = useState("5");
  const [filter, setFilter] = useState("none");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCameraInverted, setIsCameraInverted] = useState(true); // Default to mirrored (true)
  const [autoInvert, setAutoInvert] = useState(true); // Default to auto-invert (true)

  const layoutConfig = {
  "2x6": { photos: 2, width: 600, height: 1000 }, // Double the dimensions
  "3x4": { photos: 3, width: 600, height: 1400 },
  "4x6": { photos: 4, width: 600, height: 1600 },
};

  useEffect(() => {
    if (currentStep === "capture") {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentStep]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Apply initial inversion based on autoInvert setting
        updateCameraInversion();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const updateCameraInversion = () => {
    if (videoRef.current) {
      if (autoInvert) {
        // Always mirror the camera preview
        videoRef.current.style.transform = "scaleX(-1)";
      } else {
        // Use manual inversion setting
        videoRef.current.style.transform = isCameraInverted ? "scaleX(-1)" : "scaleX(1)";
      }
    }
  };

  const toggleCameraInversion = () => {
    setIsCameraInverted(!isCameraInverted);
    updateCameraInversion();
  };

  const toggleAutoInvert = () => {
    setAutoInvert(!autoInvert);
    // Update inversion immediately when auto mode changes
    updateCameraInversion();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Apply filter
    context.filter = getFilterStyle(filter);
    
    // Handle inversion for captured photo
    if (autoInvert || isCameraInverted) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    context.drawImage(videoRef.current, 0, 0);

    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const config = layoutConfig[selectedLayout as keyof typeof layoutConfig];
    
    setCapturedPhotos(prev => {
      const newPhotos = [...prev, photoDataUrl];
      
      if (newPhotos.length >= config.photos) {
        setAutoCapture(false);
        setTimeout(() => {
          setCurrentStep("preview");
        }, 1000);
      } else if (autoCapture) {
        setTimeout(() => {
          startCountdown();
        }, 2000);
      }
      
      return newPhotos;
    });
    
    setCurrentPhotoIndex(prev => prev + 1);
  };

  const getFilterStyle = (filterType: string) => {
    switch (filterType) {
      case "bw": return "grayscale(100%)";
      case "sepia": return "sepia(100%)";
      case "vintage": return "sepia(50%) contrast(120%) brightness(110%)";
      default: return "none";
    }
  };

  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(parseInt(timer));
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          capturePhoto();
          setIsCapturing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setCurrentStep("capture");
  };

const downloadPhotos = async () => {
  if (!selectedLayout || capturedPhotos.length === 0) {
    console.error("Missing required elements for download");
    return;
  }

  setIsDownloading(true);
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = layoutConfig[selectedLayout as keyof typeof layoutConfig];
    canvas.width = config.width;
    canvas.height = config.height;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoHeight = Math.floor((canvas.height - 80) / config.photos);
    const photoWidth = canvas.width - 40;
    const padding = 20;

    for (let i = 0; i < capturedPhotos.length; i++) {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = capturedPhotos[i];
      });

      // Draw each photo with padding and border
      ctx.drawImage(img, padding, i * photoHeight + padding, photoWidth, photoHeight - 20);
    }

    // Add "quick snap" branding at the bottom (like in the preview)
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('quick snap', canvas.width / 2, canvas.height - 20);

    const link = document.createElement('a');
    link.download = `snappy-${selectedLayout}-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  } catch (error) {
    console.error('Error generating photo strip:', error);
  } finally {
    setIsDownloading(false);
  }
};

  if (currentStep === "layout") {
    return (
      <LayoutSelector
        onSelect={(layout) => {
          setSelectedLayout(layout);
          setCapturedPhotos([]);
          setCurrentPhotoIndex(0);
          setCurrentStep("timer");
        }}
        onBack={onBack}
      />
    );
  }

  if (currentStep === "preview") {
    return (
      <PhotoPreview
        photos={capturedPhotos}
        layout={selectedLayout}
        onRetake={handleRetake}
        onDownload={downloadPhotos}
        isDownloading={isDownloading}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Allura', cursive" }}>
          snappy
        </h2>
        <div className="w-8" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center p-4">
        <div className="flex space-x-2">
          {["timer", "filter", "capture"].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                ["timer", "filter", "capture"].indexOf(currentStep) >= index
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {currentStep === "timer" && (
          <Card className="max-w-md mx-auto p-6 space-y-6">
            <h3 className="text-xl font-medium text-center">select timer</h3>
            <Select value={timer} onValueChange={setTimer}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setCurrentStep("filter")} className="w-full">
              Next
            </Button>
          </Card>
        )}

        {currentStep === "filter" && (
          <Card className="max-w-md mx-auto p-6 space-y-6">
            <h3 className="text-xl font-medium text-center">select filter</h3>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setCurrentStep("capture")} className="w-full">
              Start Shooting
            </Button>
          </Card>
        )}

        {currentStep === "capture" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-auto"
                style={{ filter: getFilterStyle(filter) }}
              />
              
              {countdown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-6xl font-bold animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <Badge variant="secondary">
                  {capturedPhotos.length} / {layoutConfig[selectedLayout as keyof typeof layoutConfig]?.photos || 0}
                </Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                {/* Auto/Manual Capture */}
                <Button
                  variant="outline"
                  onClick={() => setAutoCapture(!autoCapture)}
                  className={autoCapture ? "bg-primary text-primary-foreground" : ""}
                >
                  {autoCapture ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {autoCapture ? "Auto" : "Manual"}
                </Button>
                
                {/* Camera Inversion Toggle */}
                <Button
                  variant="outline"
                  onClick={toggleCameraInversion}
                  className={!autoInvert && isCameraInverted ? "bg-primary text-primary-foreground" : ""}
                  disabled={autoInvert}
                >
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Mirror
                </Button>

                {/* Auto-Invert Toggle */}
                <Button
                  variant="outline"
                  onClick={toggleAutoInvert}
                  className={autoInvert ? "bg-primary text-primary-foreground" : ""}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Auto Mirror
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={startCountdown}
                  disabled={isCapturing}
                  size="lg"
                  className="rounded-full w-16 h-16"
                >
                  <Camera className="w-6 h-6" />
                </Button>
              </div>
              
              {capturedPhotos.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {capturedPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Captured ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border-2 border-primary"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoboothCamera;