// Must be the FIRST import in any standalone script that also imports
// lib/db.ts. ES module import declarations evaluate fully (in declared
// order) before the importing file's own top-level statements run - so a
// `config()` call written above `import { db } from "@/lib/db"` in the same
// file still runs AFTER lib/db.ts's module body (which reads
// process.env.DATABASE_URL at import time). Putting the env setup inside its
// own already-imported module avoids that trap: this module's top-level
// code below runs to completion as part of evaluating *this* import, before
// the script moves on to evaluate the next one. (DNS resolution for the DB
// host itself is patched inside lib/db.ts - see lib/dnsPatch.ts.)
import { config } from "dotenv";

config({ path: ".env.local" });
