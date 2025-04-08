import { DocumentClass } from "./documentClass";

export interface Document {
    id: number;
    document_class_id: number;
    codeclassedocument: string;
    libelle: string;
    code: string;
    documentClass: DocumentClass;
  }
  