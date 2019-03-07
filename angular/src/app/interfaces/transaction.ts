export interface Transaction {
    idImage: string;
    hashImagem: string;
    newOwner: string;
    license: License;
}

export interface License {
    adapt: boolean;
    diminish: boolean;
    embed: boolean;
    enhance: boolean;
    enlarge: boolean;
    issue: boolean;
    modify: boolean;
    play: boolean;
    print: boolean;
    reduce: boolean;
}