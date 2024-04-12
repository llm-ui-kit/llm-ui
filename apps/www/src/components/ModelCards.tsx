import type { Model } from "@/types";
import React from "react";

type ModelCardsProps = {
  models: Model[];
};

export const ModelCards: React.FC<ModelCardsProps> = ({ models }) => {
  return (
    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {models.map((model, index) => (
        <div
          key={index}
          className="bg-background group relative overflow-hidden rounded-2xl border p-5 md:p-8"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 aspect-video -translate-y-1/2 rounded-full border bg-gradient-to-b from-purple-500/80 to-white opacity-25 blur-2xl duration-300 group-hover:-translate-y-1/4 dark:from-white dark:to-white dark:opacity-5 dark:group-hover:opacity-10"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="border-border relative flex size-12 rounded-2xl border shadow-sm *:relative *:m-auto *:size-6">
              {model.logo}
            </div>
            <p className="text-lg font-semibold">{model.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
