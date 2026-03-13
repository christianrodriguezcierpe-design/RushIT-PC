const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const getSupabaseEnv = () => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
};
