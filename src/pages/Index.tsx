import { useState } from "react";
import PhotoboothLanding from "@/components/PhotoboothLanding";
import PhotoboothCamera from "@/components/PhotoboothCamera";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "camera">("landing");

  const handleStart = () => {
    setCurrentView("camera");
  };

  const handleBack = () => {
    setCurrentView("landing");
  };

  if (currentView === "camera") {
    return <PhotoboothCamera onBack={handleBack} />;
  }

  return <PhotoboothLanding onStart={handleStart} />;
};

export default Index;
