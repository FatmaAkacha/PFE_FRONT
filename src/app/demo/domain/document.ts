import { DocumentClass } from "./documentClass";
  
  export interface Document {
    id: number;
    document_class_id: number;
    codeclassedocument?: string;
    libelle?: string;
    code?: string;
    dateDocument?: string;
    etat?: string;
    preparateur?: string;
    client_id?: number;
    devise?: string;
    tauxEchange?: number;
    dateLivraison?: string;
    produitsCommandes?: any[]; 
    documentClass?: DocumentClass;
  }
  