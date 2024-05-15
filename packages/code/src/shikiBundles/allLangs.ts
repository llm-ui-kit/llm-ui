import { BundledLanguageInfo, LanguageRegistration } from "shiki/core";

export const allLangs = (
  bundledLanguagesInfo: BundledLanguageInfo[],
): Promise<{
  default: LanguageRegistration[];
}>[] => bundledLanguagesInfo.map((lang) => lang.import());

type LangAlias = Record<string, string>;

export const allLangsAlias = (
  bundledLanguagesInfo: BundledLanguageInfo[],
): LangAlias =>
  bundledLanguagesInfo.reduce((acc, lang) => {
    if (lang.aliases) {
      for (const alias of lang.aliases) {
        acc[alias] = lang.id;
      }
    }
    return acc;
  }, {} as LangAlias);
