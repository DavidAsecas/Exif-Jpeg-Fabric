import { Component } from '@angular/core';
import { FabricService} from '../services/fabric.service';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';

@Component({
    selector: 'pm-block',
    templateUrl: './blockchain.component.html'
})
export class BlockchainComponent {
    history: string;
    constructor(private fabricService: FabricService) {

    }

    sellLicense(channel: string) {
        // let request: SellLicenseRequest = {

        // }
        // this.fabricService.sellLicense()
    }

    getHistory(channel: string) {

    }
}