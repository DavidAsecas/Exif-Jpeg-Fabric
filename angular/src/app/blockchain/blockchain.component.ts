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
    
    private _History : Transaction;
    public get History() : Transaction {
        return this._History;
    }
    public set History(v : Transaction) {
        this._History = v;
    }
    
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
                this._History = res.queryResponse;
            })
    }

    getUserInfo(userName: string): User {
        let user: User;
        switch (userName) {
            case 'user1':
                return user = {
                    userName: userName,
                    peer: 'peer0',
                    url: 'grpcs://localhost:7051',
                    ca: 'User1@app.jpeg.com'
                };
            case 'user2':
                return user = {
                    userName: userName,
                    peer: 'peer1',
                    url: 'grpcs://localhost:7151',
                    ca: 'User2@app.jpeg.com'
                };
            case 'user3':
                return user = {
                    userName: userName,
                    peer: 'peer2',
                    url: 'grpcs://localhost:7251',
                    ca: 'User3@app.jpeg.com'
                };
            case 'user4':
                return user = {
                    userName: userName,
                    peer: 'peer3',
                    url: 'grpcs://localhost:7351',
                    ca: 'User4@app.jpeg.com'
                };
            case 'user5':
                return user = {
                    userName: userName,
                    peer: 'peer4',
                    url: 'grpcs://localhost:7451',
                    ca: 'User5@app.jpeg.com'
                };
            default:
                return null;
        }
    }
}