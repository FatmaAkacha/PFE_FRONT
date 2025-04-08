import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsCommandesComponent } from './produits-commandes.component';

describe('ProduitsCommandesComponent', () => {
  let component: ProduitsCommandesComponent;
  let fixture: ComponentFixture<ProduitsCommandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProduitsCommandesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsCommandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
