export type ServiceSettings = {
  schemaConverterApiUrl: string;
  discoSheetApiUrl: string;
};

const SERVICE_SETTINGS_STORAGE_KEY = "loginpage.serviceSettings";

export const DEFAULT_SERVICE_SETTINGS: ServiceSettings = {
  schemaConverterApiUrl: import.meta.env.VITE_SCHEMA_CONVERTER_API_URL ?? "http://localhost:4000",
  discoSheetApiUrl: import.meta.env.VITE_DISCOSHEET_API_URL ?? "http://localhost:4000",
};

export const SERVICE_CONFIG = {
  schemaConverter: {
    apiUrl: DEFAULT_SERVICE_SETTINGS.schemaConverterApiUrl,
  },
  discoSheet: {
    apiUrl: DEFAULT_SERVICE_SETTINGS.discoSheetApiUrl,
  },
} as const;

export function loadServiceSettings(): ServiceSettings {
  const storedSettings = window.localStorage.getItem(SERVICE_SETTINGS_STORAGE_KEY);

  if (!storedSettings) {
    return DEFAULT_SERVICE_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SERVICE_SETTINGS,
      ...JSON.parse(storedSettings),
    };
  } catch {
    return DEFAULT_SERVICE_SETTINGS;
  }
}

export function saveServiceSettings(settings: ServiceSettings) {
  window.localStorage.setItem(SERVICE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function clearServiceSettings() {
  window.localStorage.removeItem(SERVICE_SETTINGS_STORAGE_KEY);
}
