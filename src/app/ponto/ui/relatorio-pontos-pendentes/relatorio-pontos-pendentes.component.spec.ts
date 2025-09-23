import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioPontosPendentesComponent } from './relatorio-pontos-pendentes.component';

describe('RelatorioPontosPendentesComponent', () => {
  let component: RelatorioPontosPendentesComponent;
  let fixture: ComponentFixture<RelatorioPontosPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioPontosPendentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioPontosPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
