
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eujabkmkrwazaxyorhcw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1amFia21rcndhemF4eW9yaGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTEyODQsImV4cCI6MjA4Njg4NzI4NH0.mUWfMR6VAETSjpRBZPGjAFBqIWw8YQRmzqYc06vFp8c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Connection Successful! Data:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
