import React from 'react';
import { 
  Package, 
  Apple, 
  Milk, 
  CupSoda, 
  Cookie, 
  Sparkles, 
  ShoppingBag, 
  Utensils 
} from 'lucide-react';

export const getCategoryIcon = (categoria: string) => {
  const cat = (categoria || '').toLowerCase();

  if (cat.includes('fruta') || cat.includes('verdura')) {
    return Apple;
  }
  if (cat.includes('lácteo') || cat.includes('lacteo') || cat.includes('queso') || cat.includes('leche')) {
    return Milk;
  }
  if (cat.includes('bebida') || cat.includes('refresco') || cat.includes('jugo') || cat.includes('agua')) {
    return CupSoda;
  }
  if (cat.includes('snack') || cat.includes('botana') || cat.includes('galleta') || cat.includes('pan')) {
    return Cookie;
  }
  if (cat.includes('limpieza') || cat.includes('detergente') || cat.includes('higiene')) {
    return Sparkles;
  }
  if (cat.includes('abarrotes') || cat.includes('despensa') || cat.includes('enlatados')) {
    return Utensils;
  }

  return Package;
};