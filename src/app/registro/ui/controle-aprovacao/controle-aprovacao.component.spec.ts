import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleAprovacaoComponent } from './controle-aprovacao.component';

describe('ControleAprovacaoComponent', () => {
  let component: ControleAprovacaoComponent;
  let fixture: ComponentFixture<ControleAprovacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControleAprovacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControleAprovacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
