import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testNotificationSystem() {
  console.log('Testing notification system...');
  
  try {
    // Check if admin_notifications table exists and has data
    const { data: notifications, error: notifError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notifError) {
      console.error('Error fetching notifications:', notifError);
    } else {
      console.log('Recent notifications:', notifications?.length || 0);
      if (notifications && notifications.length > 0) {
        console.log('Latest notification:', notifications[0]);
      }
    }
    
    // Check if provider_registration_requests table has data
    const { data: requests, error: reqError } = await supabase
      .from('provider_registration_requests')
      .select(`
        *,
        categories(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (reqError) {
      console.error('Error fetching registration requests:', reqError);
    } else {
      console.log('Recent registration requests:', requests?.length || 0);
      if (requests && requests.length > 0) {
        console.log('Latest request:', requests[0]);
        console.log('Request details:', requests.map(r => ({
          id: r.id,
          business_name: r.business_name,
          category: r.categories?.name,
          status: r.status,
          created_at: r.created_at
        })));
      }
    }
    
    // Check if trigger function exists
    const { data: functions, error: funcError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT proname FROM pg_proc WHERE proname = 'notify_admin_new_provider_request';`
      });
    
    if (funcError) {
      console.error('Error checking trigger function:', funcError);
    } else {
      console.log('Trigger function exists:', functions?.length > 0);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNotificationSystem();