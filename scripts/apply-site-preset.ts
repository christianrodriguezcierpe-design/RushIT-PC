import { createClient } from "@supabase/supabase-js";

import { defaultSiteDefinition } from "../src/data/siteSeed";
import { buildSiteRecordPayload } from "../src/features/site/site-storage";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase apply-script env. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running site:apply-preset.",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const payload = buildSiteRecordPayload(defaultSiteDefinition);

const run = async () => {
  const businessProfileResult = await supabase
    .from("business_profile")
    .upsert(payload.businessProfile, { onConflict: "id" });

  if (businessProfileResult.error) {
    throw businessProfileResult.error;
  }

  const deploymentConfigResult = await supabase
    .from("deployment_config")
    .upsert(payload.deploymentConfig, { onConflict: "id" });

  if (deploymentConfigResult.error) {
    throw deploymentConfigResult.error;
  }

  const fixedSectionsResult = await supabase
    .from("fixed_section_content")
    .upsert(payload.fixedSections, { onConflict: "section_key" });

  if (fixedSectionsResult.error) {
    throw fixedSectionsResult.error;
  }

  const managedSectionsResult = await supabase
    .from("managed_section_content")
    .upsert(payload.managedSections, { onConflict: "section_key" });

  if (managedSectionsResult.error) {
    throw managedSectionsResult.error;
  }

  console.log(
    `Applied preset for ${payload.businessProfile.name}: ${payload.fixedSections.length} fixed sections, ${payload.managedSections.length} managed sections.`,
  );
};

run().catch((error) => {
  console.error("Failed to apply site preset.", error);
  process.exitCode = 1;
});
