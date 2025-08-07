import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches all posts that are marked as published, ordered by creation date.
 */
export async function getPublishedPosts() {
  noStore();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published posts:', error);
    return null;
  }

  return data;
}

/**
 * Fetches a single post by its unique slug.
 * @param slug The slug of the post to fetch.
 */
export async function getPostBySlug(slug: string) {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }

  return data;
}

/**
 * Fetches all posts, including drafts. For use in the admin panel.
 */
export async function getAllPosts() {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all posts:', error);
    return null;
  }

  return data;
}