import {ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FlexModule} from '@angular/flex-layout';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {PontoService} from '../../ponto.service';
import {RegistroService} from '../../../registro/registro.service';
import {Usuario} from '../../../usuario/usuario.model';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {Registro} from '../../../registro/registro.model';
import {MatDialog} from '@angular/material/dialog';
import {AtualizacaoComponent} from '../../../registro/ui/atualizacao/atualizacao.component';
import {TabelaPontosComponent} from '../tabela-pontos/tabela-pontos.component';
import {Ponto} from '../../ponto.model';
import {RelatorioService} from './relatorio.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-relatorio-pontos',
  imports: [
    FlexModule,
    MatTableModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    TabelaPontosComponent,
    MatProgressBar,
    NgIf
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './relatorio-pontos.component.html',
  styleUrl: './relatorio-pontos.component.scss'
})
export class RelatorioPontosComponent implements OnInit, OnChanges {


  readonly periodo = new FormGroup({
    inicio: new FormControl<Date | null>(null),
    fim: new FormControl<Date | null>(null),
  });
  usuario: Usuario = new Usuario();
  pontos: Ponto[] = [];
  inicioSelecionado?: Date | null = null;
  fimSelecionado?: Date | null = null;

  foiBuscado = false;

  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log("Entra em OnChanges...");
  }

  constructor(
    private route: ActivatedRoute,
    private pontoService: PontoService,
    private registroService: RegistroService,
    private relatorioService: RelatorioService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.usuario = window.history.state.usuario;
      console.log(this.usuario);
    });
  }

  definePeriodo(): void {
    this.inicioSelecionado = this.periodo.value.inicio;
    this.fimSelecionado = this.periodo.value.fim;
    console.log(this.inicioSelecionado);
    console.log(this.fimSelecionado);
    this.foiBuscado = false;
  }

  public async buscaPontos() {
    this.isLoading = true;
    console.log("Exibir Pontos...");
    if (this.usuario.matricula && this.periodo.value.inicio && this.periodo.value.fim) {
      this.pontos = await this.funcPontos(this.usuario.matricula, this.periodo.value.inicio, this.periodo.value.fim, false);
    } else {
      this.pontos = []; // Garante que this.pontos seja um array mesmo se a condição falhar
    }
    console.log("Exibir Pontos... Pontos length " + this.pontos.length);
    this.isLoading = false;
  }

  public async atualizaPontos() {
    this.isLoading = true;
    console.log("Exibir Pontos...");
    if (this.usuario.matricula && this.periodo.value.inicio && this.periodo.value.fim) {
      this.pontos = await this.funcPontos(this.usuario.matricula, this.periodo.value.inicio, this.periodo.value.fim, true);
    } else {
      this.pontos = []; // Garante que this.pontos seja um array mesmo se a condição falhar
    }
    console.log("Exibir Pontos... Pontos length " + this.pontos.length);
    this.isLoading = false;
  }

  async funcPontos(matricula: string, inicioSelecionado: Date, fimSelecionado: Date, isUpdate: boolean): Promise<Ponto[]> {
    console.log('buscarPontos');
    console.log('inicio: ' + RelatorioPontosComponent.formataDataDeSaida(inicioSelecionado));
    console.log('fim: ' + RelatorioPontosComponent.formataDataDeSaida(fimSelecionado));
    let inicio = RelatorioPontosComponent.formataDataDeEntrada(inicioSelecionado);
    let fim = RelatorioPontosComponent.formataDataDeEntrada(fimSelecionado);
    let pontosUsuarioObservable = isUpdate ? this.pontoService.atualizaPontosUsuario(matricula, inicio, fim).toPromise()
      : this.pontoService.getPontosUsuario(matricula, inicio, fim).toPromise();
    let pontos: Ponto[] = [];

    try {
      const pontoListResponse = await pontosUsuarioObservable;
      if (pontoListResponse && pontoListResponse._embedded && pontoListResponse._embedded.pontos) {
        pontos = await Promise.all(pontoListResponse._embedded.pontos.map(async pr => {
          let ponto = Ponto.toModel(pr);
          let registroListResponse = await this.registroService.getRegistros(matricula, pr.dia.replaceAll("/", "")).toPromise();
          if (registroListResponse && registroListResponse._embedded && registroListResponse._embedded.registros) {
            ponto.registros = registroListResponse._embedded.registros.map(Registro.toModel);
          }
          return ponto;
        }));
        console.log("Quantidade de pontos: " + pontos.length);
      } else {
        pontos = [];
      }
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
      pontos = [];
    }
    this.foiBuscado = true;
    return pontos;
  }

  exibirPeriodo() {
    let dataInicio = this.inicioSelecionado;
    let dataFim = this.fimSelecionado;
    if (this.pontos)
      if (dataInicio && dataFim && this.pontos.length !== 0)
        return 'Pontos de ' + RelatorioPontosComponent.formataDataDeSaida(dataInicio) + " até " +
          RelatorioPontosComponent.formataDataDeSaida(dataFim);
      else if (dataInicio && dataFim && this.pontos.length === 0)
        return 'Não existe pontos no período de ' + RelatorioPontosComponent.formataDataDeSaida(dataInicio) + " até " +
          RelatorioPontosComponent.formataDataDeSaida(dataFim);
    return '';
  }

  async baixarRelatorio() {
    this.isLoading = true;
    try {
      if (this.usuario.matricula && this.periodo.value.inicio && this.periodo.value.fim)
        await this.relatorioService.downloadRelatorio(this.usuario.matricula, this.periodo.value.inicio, this.periodo.value.fim);
      console.log('Download do relatório iniciado com sucesso.');
    } catch (error) {
      console.error('Falha ao iniciar o download do relatório:', error);
      // Lógica para lidar com o erro (exibir mensagem ao usuário, etc.)
    }
    this.isLoading = false;
  }

  private static formataDataDeSaida(date: Date) {

    let dia = date.getDate() < 10 ? '0' + date.getDate() + '/' : date.getDate() + '/';
    let mesNumero = date.getMonth() + 1;
    let mes = (mesNumero) < 10 ? '0' + (mesNumero) + '/' : mesNumero + '/';
    let ano = date.getFullYear() + '';

    return dia + mes + ano;
  }

  private static formataDataDeEntrada(date: Date) {
    let dia = date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + '';
    let mesNumero = date.getMonth() + 1;
    let mes = (mesNumero) < 10 ? '0' + (mesNumero) : mesNumero + '';
    let ano = date.getFullYear() + '';

    return dia + mes + ano;
  }

  /**
   * Abre diálogo para atualizar lista de registros de um ponto
   */
  openAtualizacao(ponto: Ponto): void {
    const dialogRef = this.dialog.open(AtualizacaoComponent, {
      data: ponto,
      width: '800px'
    });
    dialogRef.afterClosed().subscribe((result: { registros?: Registro[] }) => {
      if (result?.registros) {
        const idx = this.pontos.findIndex(p => p.dia === ponto.dia);
        if (idx >= 0) {
          this.pontos[idx].registros = result.registros!;
        }
      }
    });
  }

  verificaMaiorListaDeRegistro(pontos
                               :
                               Ponto[]
  ) {

    let maiorListaDeRegistrosEncontrada = 0;
    pontos.forEach(ponto => {
      if (ponto.registros) {
        if (ponto.registros.length > maiorListaDeRegistrosEncontrada) {
          maiorListaDeRegistrosEncontrada = ponto.registros.length;
        }
      }
    })
    return maiorListaDeRegistrosEncontrada;
  }

}
