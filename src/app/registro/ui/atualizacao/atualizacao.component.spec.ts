import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AtualizacaoComponent } from './atualizacao.component';

describe('AtualizacaoComponent', () => {
  let component: AtualizacaoComponent;
  let fixture: ComponentFixture<AtualizacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtualizacaoComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { registros: [], matricula: '000', dia: '01/01/2021' } },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtualizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
