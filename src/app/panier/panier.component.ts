import { Component, OnInit } from '@angular/core';
import { PanierService } from 'src/app/demo/service/panier.service';
import { Produit } from 'src/app/demo/domain/produit';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {

  produitsCommandes: any[] = [];

  constructor(
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.produitsCommandes = this.panierService.getProduitsCommandes();
  }

  getTotal(): number {
    return this.produitsCommandes.reduce((acc, item) => acc + item.prixTotal, 0);
  }

  retirerProduit(index: number): void {
    this.produitsCommandes.splice(index, 1);
  }

  viderPanier(): void {
    this.panierService.viderPanier();
    this.produitsCommandes = [];
  }

  validerCommande(): void {
    this.router.navigate(['/vente/bon-commande']);
  }

  // Méthode pour augmenter la quantité d'un produit
  augmenterQuantite(index: number): void {
    const produit = this.produitsCommandes[index];
    if (produit.quantity < produit.quantitystock) {  // Assurez-vous qu'il y a du stock disponible
      produit.quantity++;
      produit.prixTotal = produit.prix * produit.quantity;  // Recalcul du prix total
    }
  }

  // Méthode pour diminuer la quantité d'un produit
  diminuerQuantite(index: number): void {
    const produit = this.produitsCommandes[index];
    if (produit.quantity > 1) {
      produit.quantity--;
      produit.prixTotal = produit.prix * produit.quantity;  // Recalcul du prix total
    }
  }
}