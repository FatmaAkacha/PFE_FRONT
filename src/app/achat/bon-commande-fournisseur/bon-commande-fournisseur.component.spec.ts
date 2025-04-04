import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonCommandeFournisseurComponent } from './bon-commande-fournisseur.component';

describe('BonCommandeFournisseurComponent', () => {
  let component: BonCommandeFournisseurComponent;
  let fixture: ComponentFixture<BonCommandeFournisseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BonCommandeFournisseurComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonCommandeFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
