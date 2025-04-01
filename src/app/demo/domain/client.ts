import { Produit } from "./produit";

export interface Client {
  id?: any;
  nom: any;
  adresse?: any;
  numero_telephone?: any;
  raison_sociale?: any;
  code?:any;
  contact?: any;
  logo?: any;
  email: any;
  produits?: Produit[];

  }
  