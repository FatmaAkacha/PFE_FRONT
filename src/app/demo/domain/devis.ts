import { Client } from "./client";
import { Produit } from "./produit";

export interface Devis {
    id?: any;
    client_id: any;
    client?: Client;
    produits: DevisProduit[];
    totalHT: any;
    tva: any;
    totalTTC: any;
    date: any;
    etat?: any;  
    preparateur?: any;
    dateDocument?:any;  

    devise?: string;        
    tauxEchange?: number;   
    dateLivraison?: any;
}

export interface DevisProduit {
    produit: Produit;
    quantite: any;
    prixTotal: any;
}
