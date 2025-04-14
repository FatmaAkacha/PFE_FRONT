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
  produitsCommandes: Produit[] = [];

  constructor(private panierService: PanierService, private router: Router) {}

  ngOnInit(): void {
    this.produitsCommandes = this.panierService.getProduitsCommandes();
  }

  getTotal(): number {
    return this.produitsCommandes.reduce((total, p) => total + ((p.prix || 0) * (p.quantitystock || 1)), 0);
  }

  retirerProduit(index: number): void {
    this.panierService.retirerProduit(index);
    this.produitsCommandes = this.panierService.getProduitsCommandes();
  }

  viderPanier(): void {
    this.panierService.viderPanier();
    this.produitsCommandes = [];
  }

  validerCommande() {
    this.router.navigate(['/vente/bon-commande']);
  }
}
