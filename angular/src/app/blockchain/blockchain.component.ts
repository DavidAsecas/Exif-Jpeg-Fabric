import { Component } from '@angular/core';
import { FabricService } from '../services/fabric.service';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { User } from '../interfaces/user';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';
import { Transaction, License } from '../interfaces/transaction';

@Component({
    selector: 'pm-block',
    templateUrl: './blockchain.component.html'
})
export class BlockchainComponent {
    history: string;
    constructor(private fabricService: FabricService) { }

    sellLicense(channel: string, seller: string, buyer: string) {
        let userSeller = this.getUserInfo(seller);
        let userBuyer = this.getUserInfo(buyer);
        let request = new SellLicenseRequest();
        let license: License = {
            adapt: true,
            diminish: true,
            embed: false,
            enhance: false,
            enlarge: true,
            issue: false,
            modify: false,
            play: true,
            print: true,
            reduce: true
        }
        let transaction: Transaction = {
            idImage: 'stonehenge',
            hashImage: 'hash',
            newOwner: userBuyer.userName,
            license: license
        }
        request = {
            seller: userSeller,
            buyer: userBuyer,
            channel: channel,
            transaction: JSON.stringify(transaction)
        }
        this.fabricService.sellLicense(request)
            .subscribe(res => {
                console.log(res);
            })
    }

    getHistory(channel: string, querier: string) {
        let userQuerier = this.getUserInfo(querier);
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