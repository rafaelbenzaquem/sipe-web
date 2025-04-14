export interface Error{
  status_code?: number;
  mensagem?: string;
  path?: string;
  timestamp?: number
}

export interface ParametroError{
  parametro?: string;
  mensagem?: string;
}

export interface ValidacaoError extends Error{
  erros?: ParametroError[];
}
