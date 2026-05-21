declare module '@schema-converter' {
  import type { ComponentType } from 'react';

  const SchemaConverterApp: ComponentType<{
    embedded?: boolean;
    activePage?: string;
    apiBaseUrl?: string;
    onPageChange?: (page: string) => void;
  }>;

  export default SchemaConverterApp;
}

declare module '@schema-converter/pages' {
  export type SchemaConverterPage = {
    id: string;
    label: string;
    path: string;
  };

  export const SCHEMA_CONVERTER_PAGES: SchemaConverterPage[];
}
