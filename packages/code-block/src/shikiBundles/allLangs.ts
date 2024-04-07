import { LanguageRegistration } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";

export const allLangs: Promise<{
  default: LanguageRegistration[];
}>[] = bundledLanguagesInfo.map((lang) => lang.import());

type LangAlias = Record<string, string>;

export const allLangsAlias: LangAlias = bundledLanguagesInfo.reduce(
  (acc, lang) => {
    if (lang.aliases) {
      for (const alias of lang.aliases) {
        acc[alias] = lang.id;
      }
    }
    return acc;
  },
  {} as LangAlias,
);
