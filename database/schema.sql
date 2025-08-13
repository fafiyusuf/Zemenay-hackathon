-- Database Schema for Zemenay Hackathon Chat System

-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security on tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON chat_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON chat_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON chat_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their conversations" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their conversations" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages from their conversations" ON chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations" ON chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_conversations 
            WHERE chat_conversations.id = chat_messages.conversation_id 
            AND chat_conversations.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_chat_conversations_updated_at 
    BEFORE UPDATE ON chat_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Blog System Tables
-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published BOOLEAN DEFAULT true
);

-- Create blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blog tables
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);

-- Enable RLS on blog tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts (public read, authenticated write)
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can create blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blog posts" ON blog_posts
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for blog_comments (public read, authenticated write)
CREATE POLICY "Anyone can view blog comments" ON blog_comments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create blog comments" ON blog_comments
    FOR INSERT WITH CHECK (true);

-- Create trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
