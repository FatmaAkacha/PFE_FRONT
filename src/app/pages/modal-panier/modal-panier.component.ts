
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PanierService } from 'src/app/demo/service/panier.service';

@Component({
  selector: 'app-modal-panier',
  templateUrl: './modal-panier.component.html'
})
export class ModalPanierComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() valider = new EventEmitter<void>();

  constructor(private panierService: PanierService) {}

  get commandeProduits() {
    return this.panierService.getProduitsCommandes();
  }

  get prixTotal(): number {
    return this.commandeProduits.reduce((total, p) =>
      total + (p.prix || 0) * (p.quantitystock || 1), 0);
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  validerCommande() {
    this.valider.emit();
    this.close();
  }
  supprimerProduit(index: number) {
    this.commandeProduits.splice(index, 1);
  }
  get peutValiderCommande(): boolean {
    return this.commandeProduits.some(p => (p.quantitystock || 0) > 0);
  }
  
}
