// Fichier: produits-commandes.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produit } from 'src/app/demo/domain/produit';
import { DataService } from 'src/app/demo/service/data.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-produits-commandes',
  templateUrl: './produits-commandes.component.html',
  styleUrls: ['./produits-commandes.component.scss']
})
export class ProduitsCommandesComponent implements OnInit {
  afficherModalCommande = false;
  produits: Produit[] = [];
  sortKey = '';
  sortField = '';
  sortOrder = 1;
  sortOptions = [
    { label: 'Prix décroissant', value: '!prix' },
    { label: 'Prix croissant', value: 'prix' }
  ];
  commandeProduits: any[] = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private panierService: PanierService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    const nav = this.router.getCurrentNavigation();
    this.produits = nav?.extras?.state?.['produits'] || [];
  }

  ngOnInit() {
    this.commandeProduits = this.panierService.getProduitsCommandes();
    this.dataService.getProduits().subscribe(data => {
      this.produits = data.map((p: any) => ({
        ...p,
        quantitystock: p.quantitystock ?? 0,
        image: this.getImageUrl(p.image_data),
        rating: p.rating ?? (Math.floor(Math.random() * 5) + 1),
        categorie: p.categorie ?? { id: 0, nom: 'Général' },
        categorieNom: p.categorie?.nom ?? 'Général',
        inventoryStatus: (() => {
          const quantity = p.quantity ?? 0;
          const quantitystock = p.quantitystock ?? 0;
          if (quantitystock === 0) {
            return 'Rupture';
          } else if (Math.abs(quantity - quantitystock) <= 1) {
            return 'StockFaible';
          } else {
            return 'EnStock';
          }
        })()
        
      }));
    });
  }

  getImageUrl(imageData: string): SafeUrl {
    if (imageData) {
      const fullUrl = `http://localhost:8000/storage/${imageData}`;
      return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
    }
    return 'https://via.placeholder.com/150';
  }

  onAddToCart(product: any) {

    console.log(product)
    const quantite = product.quantity || 1;
    const produitCopie: Produit = { ...product };
    this.panierService.ajouterProduit(produitCopie);

    this.messageService.add({
      severity: 'success',
      summary: 'Produit ajouté',
      detail: `${quantite} x ${product.nom} ajouté(s) au bon de commande`
    });
  }

  get prixTotal(): number {
    return this.commandeProduits.reduce((total, produit) => {
      const quantite = produit.quantitystock || 1;
      const prixUnitaire = produit.prix || 0;
      return total + quantite * prixUnitaire;
    }, 0);
  }

  ouvrirBonDeCommande() {
    this.router.navigate(['/vente/bon-commande']);
  }

  onSortChange(event: any) {
    const value = event.value;
    if (value.startsWith('!')) {
      this.sortOrder = -1;
      this.sortField = value.substring(1);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }
  validerCommande() {
    this.messageService.add({
      severity: 'success',
      summary: 'Commande validée',
      detail: 'La commande a été enregistrée avec succès.'
    });
  
    this.router.navigate(['/vente/panier']);
  }
  

  onQuantityChange(product: any): void {
    if (product.quantity >= product.quantitystock) {
      
        this.messageService.add({
          severity: 'warn',
          summary: 'Quantité maximale atteinte',
          detail: ' Vous avez atteint la quantité en stock.'
        });
       
    }
    }
  
}