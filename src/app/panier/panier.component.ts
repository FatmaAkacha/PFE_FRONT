import { Component, OnInit } from '@angular/core';
import { PanierService } from 'src/app/demo/service/panier.service';
import { Produit } from 'src/app/demo/domain/produit';
import { DataService } from '../demo/service/data.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {
  produitsCommandes: Produit[] = [];
  produitsDisponibles: Produit[] = [];
  afficherSelectionProduits = false;
  recherche: string = '';
  quantites: { [produitId: string]: number } = {};

  constructor(private panierService: PanierService, 
              private router: Router, 
              private dataService: DataService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.produitsCommandes = this.panierService.getProduitsCommandes();
    this.chargerProduitsDisponibles();
  }
  getImageSrc(produit: Produit): SafeUrl | string {
    if (typeof produit.image_data === 'string' && produit.image_data.trim() !== '') {
      const src = `http://localhost:8000/storage/${produit.image_data}`;
      return this.sanitizer.bypassSecurityTrustUrl(src);
    }
    return '';
  }
  get produitsFiltres(): Produit[] {
    const query = this.recherche?.toLowerCase() || '';
    return this.produitsDisponibles.filter(p =>
      p.nom.toLowerCase().includes(query)
    );
  }
  ajouterProduitAvecQuantite(produit: Produit): void {
    const quantite = this.quantites[produit.id] || 1;
    if (quantite <= 0) return;
  
    const produitExistant = this.produitsCommandes.find(p => p.id === produit.id);
    if (produitExistant) {
      produitExistant.quantitystock! += quantite;
    } else {
      this.produitsCommandes.push({ ...produit, quantitystock: quantite });
    }
  
    // Nettoyer la quantité et mettre à jour la liste
    this.quantites[produit.id] = 1;
    this.chargerProduitsDisponibles();
  }
  chargerProduitsDisponibles(): void {
    this.dataService.getProduits().subscribe({
      next: (produits: Produit[]) => {
        this.produitsDisponibles = produits.filter(
          p => !this.produitsCommandes.find(pc => pc.id === p.id)
        );
        this.produitsDisponibles.forEach(p => {
          if (!this.quantites[p.id]) this.quantites[p.id] = 1;
        });
      },
      error: (err) => {
        console.error('Erreur de chargement des produits', err);
      }
    });
  }
  
  ajouterAuPanier(produit: Produit): void {
    this.produitsCommandes.push({ ...produit, quantitystock: 1 });
    this.chargerProduitsDisponibles(); // Recalculer la liste disponible
  }
  getTotal(): number {
    return this.produitsCommandes.reduce((total, p) => total + ((p.prix || 0) * (p.quantity || 1)), 0);
  }

  retirerProduit(index: number): void {
    this.panierService.retirerProduit(index);
    this.produitsCommandes = this.panierService.getProduitsCommandes();
    this.chargerProduitsDisponibles();
  }

  viderPanier(): void {
    this.panierService.viderPanier();
    this.produitsCommandes = [];
    this.chargerProduitsDisponibles();
  }

  validerCommande() {
    this.router.navigate(['/vente/bon-commande']);
  }
}
