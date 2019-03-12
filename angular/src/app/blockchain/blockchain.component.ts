import { Component } from '@angular/core';
import { FabricService } from '../services/fabric.service';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { User } from '../interfaces/user';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';

@Component({
    selector: 'pm-block',
    templateUrl: './blockchain.component.html'
})
export class BlockchainComponent {
    history: string;
    constructor(private fabricService: FabricService) { }

    sellLicense(seller: string, buyer: string) {
        let userSeller = this.getUserInfo(seller);
        let userBuyer = this.getUserInfo(buyer);
        let channel = seller + '-stonehenge';
        let request = new SellLicenseRequest();
        request = {
            seller: userSeller,
            buyer: userBuyer,
            channel: channel,
            transaction: null
        }
        this.fabricService.sellLicense(request)
            .subscribe(res => {
                console.log(res);
            })
    }

    getHistory(querier: string) {
        let userQuerier = this.getUserInfo(querier);
        let channel = querier + '-stonehenge';
        let request = new GetHistoryRequest();
        request = {
            channel: channel,
            imageId: 'stonehenge',
            querier: userQuerier
        }
        this.fabricService.getHistory(request)
            .subscribe(res => {
                console.log(res);
            })
    }

    getUserInfo(userName: string): User {
        let user: User;
        switch (userName) {
            case 'User1':
                return user = {
                    userName: userName,
                    peer: 'peer0',
                    url: 'grpcs://localhost:7051'
                };
            case 'User2':
                return user = {
                    userName: userName,
                    peer: 'peer1',
                    url: 'grpcs://localhost:7151'
                };
            case 'User3':
                return user = {
                    userName: userName,
                    peer: 'peer2',
                    url: 'grpcs://localhost:7251'
                };
            case 'User4':
                return user = {
                    userName: userName,
                    peer: 'peer3',
                    url: 'grpcs://localhost:7351'
                };
            case 'User5':
                return user = {
                    userName: userName,
                    peer: 'peer4',
                    url: 'grpcs://localhost:7451'
                };
            default:
                return null;
        }
    }
}