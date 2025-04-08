import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { Produit } from 'src/app/demo/domain/produit';

@Component({
  selector: 'app-bon-commande-fournisseur',
  templateUrl: './bon-commande-fournisseur.component.html',
  providers: [ConfirmationService, MessageService],
})
export class BonCommandeFournisseurComponent implements OnInit {
  fournisseur: Fournisseur = {} as Fournisseur;
  produitsCommandes: Produit[] = [];
  formattedOrderNumber = '000123';

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    // charger fournisseur et produits depuis stockage/service
  }

  confirmerReception() {
    this.confirmationService.confirm({
      message: 'Confirmer la réception des produits ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.passerReception()
    });
  }

  passerReception() {
    localStorage.setItem('receptionFournisseur', JSON.stringify(this.fournisseur));
    localStorage.setItem('receptionProduits', JSON.stringify(this.produitsCommandes));
    localStorage.setItem('receptionOrderNumber', this.formattedOrderNumber);
    this.router.navigate([`/achat/bon-reception/${this.formattedOrderNumber}`]);
  }
}