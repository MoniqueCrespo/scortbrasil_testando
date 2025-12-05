import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting cleanup of expired stories...');

    // Fetch expired stories
    const { data: expiredStories, error: fetchError } = await supabase
      .from('profile_stories')
      .select('id, media_url')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired stories:', fetchError);
      throw fetchError;
    }

    if (!expiredStories || expiredStories.length === 0) {
      console.log('No expired stories found');
      return new Response(
        JSON.stringify({ message: 'No expired stories to clean up', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${expiredStories.length} expired stories`);

    // Delete media files from storage
    const deletePromises = expiredStories.map(async (story) => {
      try {
        // Extract file path from URL
        const url = new URL(story.media_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/story-media\/(.+)/);
        
        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1];
          console.log(`Deleting file: ${filePath}`);
          
          const { error: deleteError } = await supabase.storage
            .from('story-media')
            .remove([filePath]);

          if (deleteError) {
            console.error(`Error deleting file ${filePath}:`, deleteError);
          }
        }
      } catch (err) {
        console.error(`Error processing story ${story.id}:`, err);
      }
    });

    await Promise.all(deletePromises);

    // Delete story records from database
    const storyIds = expiredStories.map(s => s.id);
    const { error: deleteDbError } = await supabase
      .from('profile_stories')
      .delete()
      .in('id', storyIds);

    if (deleteDbError) {
      console.error('Error deleting story records:', deleteDbError);
      throw deleteDbError;
    }

    console.log(`Successfully cleaned up ${expiredStories.length} expired stories`);

    return new Response(
      JSON.stringify({ 
        message: 'Expired stories cleaned up successfully', 
        count: expiredStories.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
