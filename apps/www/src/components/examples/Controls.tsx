import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";

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
  delayMultiplier: number;
  onDelayMultiplier: (delayMultiplier: number) => void;
  isPlaying: boolean;
  showPlayPause: boolean;
  onPause: () => void;
  onStart: () => void;
}> = ({
  className,
  delayMultiplier,
  onDelayMultiplier,
  isPlaying,
  showPlayPause,
  onPause,
  onStart,
}) => {
  return (
    <div
      className={cn(
        className,
        "flex flex-row justify-center items-start gap-4",
      )}
    >
      <div className="flex flex-col items-center">
        <Slider
          className="w-52 mt-4"
          value={[inverseTransformSliderValue(delayMultiplier)]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(newValue) => {
            onDelayMultiplier(transformSliderValue(newValue[0]));
          }}
        />
        <p className="mt-4">{(1 / delayMultiplier).toFixed(1)}x</p>
      </div>
      {showPlayPause && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (isPlaying) {
              onPause();
            } else {
              onStart();
            }
          }}
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
