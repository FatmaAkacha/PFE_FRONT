import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagasinierComponent } from './magasinier.component';

describe('MagasinierComponent', () => {
  let component: MagasinierComponent;
  let fixture: ComponentFixture<MagasinierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagasinierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagasinierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
