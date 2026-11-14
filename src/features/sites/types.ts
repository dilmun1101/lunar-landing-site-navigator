export type SiteGroup = 'clps' | 'apollo';

export interface CatalogSite {
  id: string;
  /** Отображаемое имя. Не переводится (принятые английские названия). */
  name: string;
  group: SiteGroup;
}
