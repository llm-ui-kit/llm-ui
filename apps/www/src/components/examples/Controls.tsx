import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";
import { ButtonToggleGroup } from "../ui/custom/ButtonToggleGroup";
import type { Tab } from "./types";

const min = 0;
const max = 10;

// Transforms the value of the slider to a delay multiplier
const transformSliderValue = (x: number): number => {
  if (x >= min && x <= 5) {
    return -1.8 * x + max;
  } else if (x > 5 && x <= max) {
    return -0.2 * x + 2;
  }
  // shouldn't happen
  return 1;
};

const inverseTransformSliderValue = (y: number): number => {
  if (y === 0) {
    return max;
  } else if (y > 1 && y <= max) {
    return (max - y) / 1.8;
  } else if (y > min && y <= 1) {
    return (2 - y) / 0.2;
  }
  return 5;
};

const formatDelayMultiplier = (
  delayMultiplier: number,
  max: number,
): string => {
  if (delayMultiplier === 0) {
    return `${max}x`;
  }
  const value = 1 / delayMultiplier;
  const isCloseToWholeNumber = Math.abs(value - Math.round(value)) < 0.01;
  const decimalPlaces = isCloseToWholeNumber ? 0 : 1;
  return `${value.toFixed(decimalPlaces)}x`;
};

export const Controls: React.FC<{
  className?: string;
  delayMultiplier: number;
  onDelayMultiplier: (delayMultiplier: number) => void;
  isPlaying: boolean;
  showPlayPause: boolean;
  showSlider: boolean;
  isAutoStart: boolean;
  onPause: () => void;
  onStart: () => void;
  desktopTabs: Tab[];
  mobileTabs: Tab[];
  onDesktopTabIndexChange: (index: number) => void;
  onMobileTabIndexChange: (index: number) => void;
  desktopTabIndex: number;
  mobileTabIndex: number;
}> = ({
  className,
  delayMultiplier,
  onDelayMultiplier,
  isPlaying,
  showPlayPause,
  showSlider,
  isAutoStart,
  onPause,
  onStart,
  desktopTabs,
  mobileTabs,
  onDesktopTabIndexChange,
  onMobileTabIndexChange,
  desktopTabIndex,
  mobileTabIndex,
}) => {
  return (
    <div
      className={cn(
        className,
        `flex flex-row max-sm:justify-between sm:grid sm:grid-cols-3 items-center gap-4 bg-muted p-1 rounded-b-lg`,
      )}
    >
      <div className="sm:justify-self-start justify-self-auto">
        {mobileTabs.length > 1 && (
          <ButtonToggleGroup
            className="md:hidden "
            buttons={mobileTabs.map((tab) => ({
              text: tab,
            }))}
            onIndexChange={onMobileTabIndexChange}
            tabIndex={mobileTabIndex}
          />
        )}
        {desktopTabs.length > 1 && (
          <ButtonToggleGroup
            className="hidden md:block"
            buttons={desktopTabs.map((tab) => ({
              text: tab,
            }))}
            onIndexChange={onDesktopTabIndexChange}
            tabIndex={desktopTabIndex}
          />
        )}
      </div>
      {showSlider && (
        <div className="flex flex-row sm:flex-1 items-center gap-2 sm:justify-self-center justify-self-auto sm:ml-12">
          <Slider
            className="md:w-52 sm:w-36 w-24"
            variant={"secondary"}
            value={[inverseTransformSliderValue(delayMultiplier)]}
            min={min}
            max={max}
            step={0.5}
            onValueChange={(newValue) => {
              const delayMultiplier = transformSliderValue(newValue[0]);
              onDelayMultiplier(Math.min(Math.max(delayMultiplier, min), max));
            }}
          />
          <p className="text-foreground text-sm w-10 max-sm:hidden">
            {formatDelayMultiplier(delayMultiplier, max)}
          </p>
        </div>
      )}
      {showPlayPause && (
        <div className="sm:justify-self-end justify-self-auto flex justify-end py-1">
          <Button
            className="w-20 md:h-7 md:px-2 max-md:size-8 mr-[3px]"
            variant={isAutoStart ? "outline" : "default"}
            size={"xs"}
            onClick={() => {
              if (isPlaying) {
                onPause();
              } else {
                onStart();
              }
            }}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="h-4 md:w-4 md:mr-2" />
                <span className="md:block hidden">Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 md:w-4 md:mr-2" />
                <span className="md:block hidden">Play</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
