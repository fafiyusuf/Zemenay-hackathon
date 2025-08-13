-- Chat tables
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_conversation_created_at on chat_messages(conversation_id, created_at);
