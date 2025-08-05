import { useState } from "react";
import { Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


interface PhotoboothLandingProps {
  onStart: () => void;
}

const PhotoboothLanding = ({ onStart }: PhotoboothLandingProps) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-primary" style={{ fontFamily: "'Allura', cursive" }}>
   quick snap
</h1>

        
        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">
          for my mon—who always loved photobooths.
        </p>
        
        {/* Start Button */}
        <Button 
          onClick={onStart}
          size="lg"
          className="transition-all shadow-lg hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium"
        >
          <Camera className="w-5 h-5 mr-3" />
          start
        </Button>
        
        {/* Attribution */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            made by wensi.
          </p>
          
          {/* Privacy Policy Link */}
          <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary underline">
                privacy policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>privacy policy</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  this photo booth app is designed with your privacy in mind. tt does not collect, save, or share any of your data or photos. all activity takes place locally on your device, ensuring that your images never leave your browser.
                </p>
                <p>
                  the app only uses your camera with your permission, and any photos you take are yours alone—no uploads, no tracking, and no background storage.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PhotoboothLanding;