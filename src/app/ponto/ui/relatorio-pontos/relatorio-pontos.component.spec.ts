import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioPontosComponent } from './relatorio-pontos.component';

describe('RelatorioPontosComponent', () => {
  let component: RelatorioPontosComponent;
  let fixture: ComponentFixture<RelatorioPontosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioPontosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioPontosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
