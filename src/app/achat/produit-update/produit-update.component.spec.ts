import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitUpdateComponent } from './produit-update.component';

describe('ProduitUpdateComponent', () => {
  let component: ProduitUpdateComponent;
  let fixture: ComponentFixture<ProduitUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProduitUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
