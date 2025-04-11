import {Component} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Usuario} from '../usuario/usuario';

@Component({
  selector: 'app-cadastro-usuario',
  imports: [FormsModule, FlexLayoutModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrl: './cadastro-usuario.component.scss'
})
export class CadastroUsuarioComponent {
  usuario: Usuario = Usuario.novoUsuario();

  salvar(){
    console.log(this.usuario);
  }

  limpar(){
    this.usuario = Usuario.novoUsuario();
  }
}
