
import { Recipe } from './types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Traditional Masala Dosa',
    description: 'Crispy fermented rice and lentil crepes with a spiced potato filling.',
    ingredients: ['Rice', 'Urad Dal', 'Potatoes', 'Onions', 'Mustard Seeds', 'Curry Leaves'],
    instructions: ['Soak and grind batter', 'Ferment overnight', 'Prepare potato masala', 'Make crispy dosas on a griddle'],
    imageUrl: 'https://picsum.photos/seed/dosa/800/600',
    time: '45 mins',
    difficulty: 'Medium'
  },
  {
    id: '2',
    title: 'Creamy Paneer Butter Masala',
    description: 'Rich and velvety tomato-based gravy with soft paneer cubes.',
    ingredients: ['Paneer', 'Tomatoes', 'Butter', 'Cream', 'Cashews', 'Garam Masala'],
    instructions: ['Puree tomatoes and cashews', 'Sauté spices in butter', 'Simmer gravy', 'Add paneer and cream'],
    imageUrl: 'https://picsum.photos/seed/paneer/800/600',
    time: '30 mins',
    difficulty: 'Easy'
  },
  {
    id: '3',
    title: 'Hyderabadi Dum Biryani',
    description: 'Fragrant long-grain basmati rice cooked with marinated meat and aromatics.',
    ingredients: ['Basmati Rice', 'Chicken/Goat', 'Yogurt', 'Saffron', 'Mint', 'Fried Onions'],
    instructions: ['Marinate meat', 'Par-boil rice', 'Layer and cook on low heat (Dum)', 'Garnish and serve'],
    imageUrl: 'https://picsum.photos/seed/biryani/800/600',
    time: '90 mins',
    difficulty: 'Hard'
  }
];
