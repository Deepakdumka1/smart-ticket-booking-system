const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    console.log('--- DB Connection Test ---');

    // 1. Manually Load .env.local
    const envPath = path.join(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found at', envPath);
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            envVars[key] = value;
        }
    });

    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log(`Supabase URL found: ${!!supabaseUrl}`);
    console.log(`Supabase Key found: ${!!supabaseKey}`);

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Credentials missing in file.');
        return;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('Attempting to fetch seats...');
        const { data, error } = await supabase.from('seats').select('*').limit(1);

        if (error) {
            console.error('❌ Supabase Connect Error:', error.message);
        } else {
            console.log('✅ Supabase Connection Success!');
            console.log(`Fetched ${data.length} row(s).`);
        }
    } catch (err) {
        console.error('❌ Client Init Error:', err.message);
    }
}

testConnection();
