import {ChangeDetectionStrategy, Component, inject, Input, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCardModule} from '@angular/material/card';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {UsuarioService} from '../../usuario.service';
import {MatDialogRef,} from '@angular/material/dialog';
import {Usuario} from '../../usuario.model';
import {merge} from 'rxjs';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ValidacaoError} from '../../../error/error.model';
import {Router} from '@angular/router';
import {AtualizacaoUsuarioDialog} from '../dialogs/dialogs.utils';

@Component({
  selector: 'app-atualizacao',
  templateUrl: './atualizacao.component.html',
  styleUrl: './atualizacao.component.scss',
  imports: [
    FormsModule, FlexLayoutModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtualizacaoComponent {

  @Input() usuario: Usuario = new Usuario();
  @Input() title: string = '';
  readonly dialogRef = inject(MatDialogRef<AtualizacaoUsuarioDialog>);

  fecharDialogo() {
    this.dialogRef.close();
  }

  usuarioInicial: Usuario = new Usuario();

  nome = new FormControl(this.usuario.nome, {
    validators: [Validators.required],
    nonNullable: true
  });
  matricula = new FormControl(this.usuario.matricula, {
    validators: [Validators.required],
    nonNullable: true
  });
  cracha = new FormControl(this.usuario.cracha, {
    validators: [Validators.required],
    nonNullable: true
  });
  hora_diaria = new FormControl(this.usuario.hora_diaria, {
    validators: [Validators.required],
    nonNullable: true
  });

  constructor(private usuarioService: UsuarioService,
              private router: Router) {
    merge(this.nome.statusChanges, this.nome.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateNomeErrorMessage());

    merge(this.matricula.statusChanges, this.matricula.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateMatriculaErrorMessage());

    merge(this.cracha.statusChanges, this.cracha.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateCrachaErrorMessage());

    merge(this.hora_diaria.statusChanges, this.cracha.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateHoraErrorMessage());
  }


  formControlInit() {
    this.nome = new FormControl(this.usuario.nome, {
      validators: [Validators.required],
      nonNullable: true
    });
    this.matricula = new FormControl(this.usuario.matricula, {
      validators: [Validators.required],
      nonNullable: true
    });
    this.cracha = new FormControl(this.usuario.cracha, {
      validators: [Validators.required],
      nonNullable: true
    });
    this.hora_diaria = new FormControl(this.usuario.hora_diaria, {
      validators: [Validators.required],
      nonNullable: true
    });
    this.profileForm = new FormGroup({
      nome: this.nome,
      matricula: this.matricula,
      cracha: this.cracha,
      hora_diaria: this.hora_diaria
    })
  }

  ngOnInit(): void {
    this.formControlInit()
    this.usuarioInicial = this.usuario;
  }


  profileForm = new FormGroup({
    nome: this.nome,
    matricula: this.matricula,
    cracha: this.cracha,
    hora_diaria: this.hora_diaria
  })

  errorNomeMessage = signal('');
  errorMatriculaMessage = signal('');
  errorCrachaMessage = signal('');
  errorHoraMessage = signal('');


  updateNomeErrorMessage() {
    if (this.nome.hasError('required')) {
      this.errorNomeMessage.set('Campo \'Nome\' obrigatório!');
    } else {
      this.errorNomeMessage.set('');
    }
  }

  updateMatriculaErrorMessage() {
    if (this.matricula.hasError('required')) {
      this.errorMatriculaMessage.set('Campo \'Matrícula\' obrigatório!');
    } else if (this.matricula.hasError('minlength')) {
      this.errorMatriculaMessage.set('Campo \'Matrícula\' deve ter no mínimo 5 caracteres!');
    } else if (this.matricula.hasError('maxLength')) {
      this.errorMatriculaMessage.set('Campo \'Matrícula\' deve ter no mínimo 20 caracteres!');
    } else {
      this.errorMatriculaMessage.set('');
    }
  }

  updateCrachaErrorMessage() {
    if (this.cracha.hasError('required')) {
      this.errorCrachaMessage.set('Campo \'Crachá Ponto\' obrigatório!');
    } else if (this.cracha.hasError('pattern')) {
      this.errorCrachaMessage.set('Campo \'Crachá Ponto\' deverá ter 16 caracteres numéricos.');
    } else {
      this.errorCrachaMessage.set('');
    }
  }

  updateHoraErrorMessage() {
    if (this.hora_diaria.hasError('required')) {
      this.errorHoraMessage.set('Campo \'Horas diária\' obrigatório!');
    } else if (this.hora_diaria.hasError('min') || this.hora_diaria.hasError('max')) {
      this.errorHoraMessage.set('Campo \'Horas diária\' deverá ser entre 4 e 12 horas.');
    } else {
      this.errorHoraMessage.set('');
    }
  }

  atualizar() {
    this.usuario.nome = this.nome.value;
    this.usuario.matricula = this.matricula.value;
    this.usuario.cracha = this.cracha.value;
    this.usuario.hora_diaria = this.hora_diaria.value;

    console.log("Atualizando o usuário: " + this.usuario);
    const obs = this.usuarioService.atualizaUsuario(this.usuario.toUpdateRequest());
    obs.subscribe({
        next: success => {
          this.usuario = Usuario.toModel(success);
          this.usuarioInicial = this.usuario;
          console.log("self: " + success._links.self.href);
          console.log("delete: " + success._links.delete.href);
          this.dialogRef.close();
        },
        error: err => {
          this.tratarErroValidacao(err);
        }
      }
    );
  }

  tratarErroValidacao(error: any) {
    if (error.status === 400 && error.error?.erros) {
      const validacao: ValidacaoError = error.error;

      validacao.erros?.forEach(paramErro => {
        const control = this.profileForm.get(paramErro.parametro || '');
        if (control) {
          control.setErrors({apiError: paramErro.mensagem});
          if (paramErro.parametro === "matricula") {
            this.errorMatriculaMessage.set(paramErro.mensagem || '');
          } else if (paramErro.parametro === "cracha") {
            this.errorCrachaMessage.set(paramErro.mensagem || '');
          }
        }
      });
    } else {
      console.error('Erro inesperado', error);
    }
  }


  naoReinicializavel(): boolean {

    let nomeNaoReinicializavel: boolean = this.usuarioInicial.nome === this.nome.value;
    let matriculaNaoReinicializavel: boolean = this.usuarioInicial.matricula === this.matricula.value;
    let crachaNaoReinicializavel: boolean = this.usuarioInicial.cracha === this.cracha.value;
    let horaDiariaReinicializavel: boolean = this.usuarioInicial.hora_diaria === this.hora_diaria.value ||
      (this.hora_diaria.value === undefined ? true : (this.hora_diaria.value < 4) ||
        this.hora_diaria.value > 12);

    return nomeNaoReinicializavel && matriculaNaoReinicializavel && crachaNaoReinicializavel && horaDiariaReinicializavel;
  }

  reiniciar() {
    this.usuario = this.usuarioInicial;
    this.formControlInit();
    this.errorNomeMessage = signal('');
    this.errorMatriculaMessage = signal('');
    this.errorCrachaMessage = signal('');
    this.errorHoraMessage = signal('');
  }
}
