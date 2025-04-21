import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaPontosComponent } from './tabela-pontos.component';

describe('TabelaPontosComponent', () => {
  let component: TabelaPontosComponent;
  let fixture: ComponentFixture<TabelaPontosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaPontosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaPontosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
