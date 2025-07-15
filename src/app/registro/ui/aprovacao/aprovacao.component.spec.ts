import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {AprovacaoComponent} from './aprovacao.component';

describe('AprovacaoComponent', () => {
  let component: AprovacaoComponent;
  let fixture: ComponentFixture<AprovacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovacaoComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {registros: [], matricula: '000', dia: '01/01/2021'}},
        {provide: MatDialogRef, useValue: {close: () => {}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AprovacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});