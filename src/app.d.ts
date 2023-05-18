// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import Database from "better-sqlite3";
import {globals} from "svelte/internal";

declare global {
    namespace App {
	// interface Error {}
    interface Locals {
        db: Database.Database
    }
	// interface PageData {}
	// interface Platform {}
    }
}
export {}
