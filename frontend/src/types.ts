export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  background_color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  name: string;
  position: string;
  board_id: string;
  created_at: string;
  cards: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  position: string;
  due_date: string;
  cover_color: string;
  list_id: string;
  created_at: string;
  updated_at: string;
}
