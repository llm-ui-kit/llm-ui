import type { Model } from "@/types";
import React from "react";
import { BackgroundCard } from "./cards/BackgroundCard";

type ModelCardsProps = {
  models: Model[];
};

export const ModelCards: React.FC<ModelCardsProps> = ({ models }) => {
  return (
    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((model, index) => (
        <BackgroundCard key={index}>
          <div className="flex flex-col items-center gap-4">
            <div className="border-border relative flex size-12 rounded-2xl border shadow-sm *:relative *:m-auto *:size-6">
              {model.logo}
            </div>
            <p className="text-lg font-semibold">{model.title}</p>
          </div>
        </BackgroundCard>
      ))}
    </div>
  );
};
