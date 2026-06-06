import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load the monorepo-root .env BEFORE any module that reads process.env at
// evaluation time (e.g. @clario/supabase's createClient). This module must be
// the first import in server.ts — ESM evaluates imports in source order, so
// importing it first guarantees env vars are populated before the Supabase
// clients are constructed.
const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, '../../../.env') });
