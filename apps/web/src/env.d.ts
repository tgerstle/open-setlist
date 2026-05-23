/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_TICKET_PROVIDERS: string;
	readonly DATABASE_PATH: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
