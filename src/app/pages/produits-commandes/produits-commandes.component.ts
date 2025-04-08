import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produit } from 'src/app/demo/domain/produit';
import { DataService } from 'src/app/demo/service/data.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-produits-commandes',
  templateUrl: './produits-commandes.component.html',
  styleUrls: ['./produits-commandes.component.scss']
})
export class ProduitsCommandesComponent implements OnInit {
  produits: Produit[] = [];
  produitsCommandes: Produit[] = []; // Tableau pour les produits ajoutés à la commande
  sortKey: string = '';
  sortField: string = '';
  sortOrder: number = 1;

  sortOptions = [
    { label: 'Prix décroissant', value: '!prix' },
    { label: 'Prix croissant', value: 'prix' }
  ];
  commandeProduits: any[] = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private panierService: PanierService,
    private messageService: MessageService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.produits = nav?.extras?.state?.['produits'] || [];
  }

  ngOnInit() {
    this.produits.forEach(p => p.quantitystock = 1); // ou une quantité par défaut
    this.dataService.getProduits().subscribe(data => {
      this.produits = data.map((p: any) => ({
        ...p,
        image: p.image || 'https://via.placeholder.com/150',
        rating: p.rating ?? (Math.floor(Math.random() * 5) + 1),
        category: p.category || 'Général',
        inventoryStatus: p.inventoryStatus || (p.quantitystock && p.quantitystock > 0 ? 'INSTOCK' : 'OUTOFSTOCK')
      }));
    });
  }

  onAddToCart(product: any) {
    const quantite = product.quantitystock || 1;
    const produitCommande = {
      produit: product,
      quantite,
      prixTotal: product.prix * quantite
    };
  
    this.panierService.ajouterProduit(produitCommande); // 💡 ici
  
    this.messageService.add({
      severity: 'success',
      summary: 'Produit ajouté',
      detail: `${quantite} x ${product.nom} ajouté(s) au bon de commande`
    });
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
}
