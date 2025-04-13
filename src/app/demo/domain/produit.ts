export interface Produit {
  id?: any;
  nom: string;
  description?: string;
  prix?: number;
  quantitystock?: number;
  seuil?: number;
  image_data?: string |File ; 
  rating?: number;
  category?: string;
  inventoryStatus?: string;
}