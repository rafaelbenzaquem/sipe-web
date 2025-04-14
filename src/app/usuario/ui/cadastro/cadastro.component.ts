import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCardModule} from '@angular/material/card';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {UsuarioService} from '../../usuario.service';
import {Usuario} from '../../usuario.model';
import {merge} from 'rxjs';
import {FlexLayoutModule} from '@angular/flex-layout';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
  imports: [FormsModule, FlexLayoutModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastroComponent {
  usuario: Usuario = new Usuario();
  nome = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true
  });
  matricula = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true
  });
  cracha = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true
  });
  hora_diaria: FormControl<number|undefined> = new FormControl(undefined, {
    validators: [Validators.required],
    nonNullable: true
  });

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

  constructor(private usuarioService: UsuarioService) {
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

  salvar() {
    this.usuario.nome = this.nome.value;
    this.usuario.matricula = this.matricula.value;
    this.usuario.cracha = this.cracha.value;
    this.usuario.hora_diaria = this.hora_diaria.value;

    console.log("Salvando o usuário: " + this.usuario);
    const obs = this.usuarioService.criarUsuario(this.usuario.toRequest());
    obs.subscribe(
      success => {
        this.usuario.id = success.id;
        console.log("self: " + success._links.self.href);
        console.log("delete: " + success._links.delete.href);
      }
    )

  }

  naolimpavel(): boolean {

    let nomeNaoLimpavel: boolean = this.nome.value === undefined || this.nome.value === '';
    let matriculaNaoLimpavel: boolean = this.matricula.value === undefined || this.matricula.value === '';
    let crachaNaoLimpavel: boolean = this.cracha.value === undefined || this.cracha.value === '';
    let horasDiariasNaoLimpaveis: boolean = this.hora_diaria.value === undefined ||
      (this.hora_diaria.value > 4 || this.hora_diaria.value < 12);

    return nomeNaoLimpavel && matriculaNaoLimpavel && crachaNaoLimpavel && horasDiariasNaoLimpaveis;
  }

  reset() {
    this.usuario = new Usuario();
    this.nome.reset();
    this.matricula.reset();
    this.cracha.reset();
    this.hora_diaria.reset();
    this.profileForm.reset()
    this.errorNomeMessage = signal('');
    this.errorMatriculaMessage = signal('');
    this.errorCrachaMessage = signal('');
    this.errorHoraMessage = signal('');

  }
}
