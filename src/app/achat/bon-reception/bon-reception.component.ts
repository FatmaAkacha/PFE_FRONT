import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { Produit } from 'src/app/demo/domain/produit';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-bon-reception',
  templateUrl: './bon-reception.component.html',
  providers: [ConfirmationService]
})
export class BonReceptionComponent implements OnInit {
  fournisseur: Fournisseur = {} as Fournisseur;
  produits: Produit[] = [];
  formattedOrderNumber: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    const fournisseurData = localStorage.getItem('receptionFournisseur');
    const produitsData = localStorage.getItem('receptionProduits');
    this.formattedOrderNumber = this.route.snapshot.paramMap.get('orderNumber') || '';

    if (fournisseurData) this.fournisseur = JSON.parse(fournisseurData);
    if (produitsData) this.produits = JSON.parse(produitsData);
  }

  confirmerFacture() {
    this.confirmationService.confirm({
      message: 'Générer une facture fournisseur ?',
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        localStorage.setItem('factureFournisseur', JSON.stringify(this.fournisseur));
        localStorage.setItem('factureProduitsFournisseur', JSON.stringify(this.produits));
        this.router.navigate([`/achat/facture/${this.formattedOrderNumber}`]);
      }
    });
  }
}