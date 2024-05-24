import { I18n, I18nArgs, I18nOptions } from "@hammerhq/localization";

export class Localization extends I18n {
  constructor(options: I18nOptions) {
    super(options);
  }

  public get(locale: string, section: string, key: string, args?: I18nArgs | undefined) {
    const currentString = super.get(locale, section, key, args);
    const locateErr = `Locale '${locale}' not found.`;
    const sectionErr = `Section '${section}' not found in locale '${locale}'`;
    const keyErr = `Key '${key}' not found in section ${section} in locale '${locale}'`;
    if (currentString == locateErr || currentString == sectionErr || currentString == keyErr) {
      return super.get("en", section, key, args);
    } else return currentString;
  }
}
