import { Injectable } from '@angular/core';
import { Produit } from 'src/app/demo/domain/produit';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private produitsCommandes: Produit[] = [];

  ajouterProduit(produit: Produit): void {
    const index = this.produitsCommandes.findIndex(p => p.id === produit.id);
    if (index !== -1) {
      this.produitsCommandes[index].quantitystock! += produit.quantitystock!;
    } else {
      this.produitsCommandes.push({ ...produit });
    }
  }

  getProduitsCommandes(): Produit[] {
    return this.produitsCommandes;
  }

  retirerProduit(index: number): void {
    this.produitsCommandes.splice(index, 1);
  }

  viderPanier(): void {
    this.produitsCommandes = [];
  }
}
