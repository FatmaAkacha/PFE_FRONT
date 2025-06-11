import { DocumentClass } from "./documentClass";
import { Client } from './client';
import { Magasinier } from "./magasinier";
  
  export interface Document {
    id: number;
    document_class_id: number;
    codeclassedocument?: string;
    num_seq?:any;
    libelle?: string;
    code?: string;
    dateDocument?: string;
    etat?: string;
    preparateur_id?: Magasinier;
    client_id?: Client;
    devise?: string;
    tauxEchange?: number;
    dateLivraison?: string;
    produitsCommandes?: any[]; 
    documentClass?: DocumentClass;
    numero:any;
  }
  