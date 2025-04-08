import { Injectable } from '@angular/core';
import { Produit } from 'src/app/demo/domain/produit';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private produitsCommandes: any[] = [];

  // Modifier la méthode pour accepter un objet produitCommande
  ajouterProduit(produitCommande: { produit: Produit, quantite: number, prixTotal: number }): void {
    this.produitsCommandes.push(produitCommande);
  }

  getProduitsCommandes() {
    return this.produitsCommandes;
  }

  viderPanier() {
    this.produitsCommandes = [];
  }
}
