import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FournisseurAjoutProduitComponent } from './fournisseur-ajout-produit.component';

describe('FournisseurAjoutProduitComponent', () => {
  let component: FournisseurAjoutProduitComponent;
  let fixture: ComponentFixture<FournisseurAjoutProduitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FournisseurAjoutProduitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FournisseurAjoutProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
