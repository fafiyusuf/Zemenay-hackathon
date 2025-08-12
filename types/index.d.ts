export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  role: 'admin' | 'author' | 'user'
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author?: string | null
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id?: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
