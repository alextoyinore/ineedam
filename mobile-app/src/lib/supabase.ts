import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owlkmvgpuzwnpaqigfuf.supabase.co';
const supabaseAnonKey = 'sb_publishable_r0kouvyQVn5fxMDmTQfbDA_v8_7IDE3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
