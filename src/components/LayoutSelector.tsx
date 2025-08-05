import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LayoutSelectorProps {
  onSelect: (layout: string) => void;
  onBack: () => void;
}

const layouts = [
  {
    id: "2x6",
    name: "2×6 photo",
    description: "classic photo strip",
    preview: (
      <div className="w-16 h-32 bg-muted rounded flex flex-col gap-1 p-1">
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
      </div>
    )
  },
  {
    id: "3x4",
    name: "3×4 photo",
    description: "extended strip",
    preview: (
      <div className="w-20 h-32 bg-muted rounded flex flex-col gap-1 p-1">
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
      </div>
    )
  },
  {
    id: "4x6",
    name: "4×6 photo",
    description: "long format",
    preview: (
      <div className="w-20 h-32 bg-muted rounded flex flex-col gap-1 p-1">
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
        <div className="flex-1 bg-background rounded"></div>
      </div>
    )
  },
];

const LayoutSelector = ({ onSelect, onBack }: LayoutSelectorProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-5xl font-bold" style={{ fontFamily: "'Allura', cursive" }}>
  snappy
</h2>

        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-medium mb-2">select number of photos</h3>
            <p className="text-muted-foreground">choose your photo strip layout</p>
          </div>

          <div className="grid gap-4">
            {layouts.map((layout) => (
              <Card
                key={layout.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary group"
                onClick={() => onSelect(layout.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {layout.preview}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg group-hover:text-primary transition-colors">
                      {layout.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {layout.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelector;