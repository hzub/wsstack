export interface ICity {
  nazwa: string;
  geo: {
    szerokość: number;
    długość: number;
  };
}

export type IEndpointQueryPrognoza = {
  miasto?: string;
};

export type IEndpointQueryLudzie = {
  imie?: string;
  nazwisko?: string;
  zainteresowania?: string;
};
