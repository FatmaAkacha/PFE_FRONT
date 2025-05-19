import { Categorie } from "./Categorie";
import { Fournisseur } from "./fournisseur";

export interface Produit {
  id?: any;
  nom: string;
  description?: string;
  prix?: any; 
  prix_achat?: number;
  prix_vente_ht?: number;
  prix_vente_ttc?: number;
  remise_maximale?: number;
  quantitystock?: number; 
  tva?:any;
  quantite?: number;
  quantity?: number;
  seuil?: number;
  image_data?: any;
  rating?: number;
  inventoryStatus?: string;
  categorie: Categorie;
  fournisseur?: Fournisseur;
}
