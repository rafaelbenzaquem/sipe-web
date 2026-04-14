export interface Lotacao {
  id: number;
  sigla: string;
  descricao: string;
}

export const LOTACOES: Lotacao[] = [
  {id: 15,  sigla: 'SJRR',   descricao: 'SECAO JUDICIARIA DE RORAIMA'},
  {id: 112, sigla: '1ª VARA', descricao: '1ª VARA DA SJRR'},
  {id: 124, sigla: '2ª VARA', descricao: '2ª VARA DA SJRR'},
  {id: 136, sigla: '3ª VARA', descricao: '3ª VARA (JEF) DA SJRR'},
  {id: 215, sigla: '4ª VARA', descricao: '4ª VARA DA SJRR'},
  {id: 77,  sigla: 'SECAD',   descricao: 'SECRETARIA ADMINISTRATIVA'},
  {id: 224, sigla: 'NUCJU',   descricao: 'NÚCLEO JUDICIÁRIO'},
  {id: 227, sigla: 'NUCAD',   descricao: 'NÚCLEO DE ADMINISTRAÇÃO'},
  {id: 253, sigla: 'NUCAF',   descricao: 'NÚCLEO DE ADMINISTRAÇÃO ORÇAMENTÁRIA, FINANCEIRA E PATRIMONIAL'},
  {id: 263, sigla: 'NUTEC',   descricao: 'NÚCLEO DE TECNOLOGIA DA INFORMAÇÃO'}
];
