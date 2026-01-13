
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TranscriptionEntry {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
