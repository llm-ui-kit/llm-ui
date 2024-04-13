import { cn } from "@/lib/utils";
import { Slider } from "../ui/Slider";
import { Text } from "../ui/Text";

// Transforms the value of the slider to a delay multiplier
const transformSliderValue = (x: number): number => {
  if (x >= 0 && x <= 5) {
    return -1.8 * x + 10;
  } else if (x > 5 && x <= 10) {
    return -0.2 * x + 2;
  }
  // shouldn't happen
  return 1;
};

const inverseTransformSliderValue = (y: number): number => {
  if (y > 1 && y <= 10) {
    return (10 - y) / 1.8;
  } else if (y > 0 && y <= 1) {
    return (2 - y) / 0.2;
  }
  return 5;
};

export const Controls: React.FC<{
  className: string;
  initialDelayMultiplier?: number;
  onDelayMultiplier: (delayMultiplier: number) => void;
}> = ({ className, initialDelayMultiplier = 1, onDelayMultiplier }) => {
  return (
    <div className={cn(className, "flex flex-col items-center gap-4")}>
      <Text>Speed</Text>
      <Slider
        className="w-52"
        defaultValue={[inverseTransformSliderValue(initialDelayMultiplier)]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={(newValue) => {
          onDelayMultiplier(transformSliderValue(newValue[0]));
        }}
      />
    </div>
  );
};
