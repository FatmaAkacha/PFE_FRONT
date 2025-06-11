import { Client } from "./client";
import { Magasinier } from "./magasinier";
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
    preparateur_id?: any;
    magasinier?: Magasinier;
    dateDocument?:any;  

    devise?: string;        
    tauxEchange?: number;   
    dateLivraison?: any;
}

export interface DevisProduit {
    produit: Produit;
    quantite: any;
    prixTotal: any;
    tva :any;
    puht : any;
}
