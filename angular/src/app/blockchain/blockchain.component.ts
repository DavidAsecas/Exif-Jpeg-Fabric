import { Component, OnInit } from '@angular/core';
import { FabricService } from '../services/fabric.service';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { User } from '../interfaces/user';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';
import { Transaction, License } from '../interfaces/transaction';
import { HashService } from '../services/hash.service';
import { InheritHistoryRequest } from '../interfaces/inheritHistoryRequest';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'pm-block',
    templateUrl: './blockchain.component.html',
    styleUrls: ['./blockchain.component.css']
})
export class BlockchainComponent implements OnInit {

    private _License: License;
    public get License(): License {
        return this._License;
    }
    public set License(v: License) {
        this._License = v;
    }
    dropdownList = ['adapt', 'diminish', 'embed', 'enhance', 'enlarge', 'issue', 'modify', 'play', 'print', 'reduce'];
    history: Transaction[];
    channels: string[];
    currentChannel: string;
    isNewChannel = true;
    loading = false;

    constructor(private fabricService: FabricService, private hashService: HashService, public snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this._License = {
            adapt: false,
            diminish: false,
            embed: false,
            enhance: false,
            enlarge: false,
            issue: false,
            modify: false,
            play: false,
            print: false,
            reduce: false
        }
    }

    openSnackBar() {
        this.snackBar.open("Transaction registered!", null ,{
            duration: 2000
        })
    }

    onItemChange(source: any) {
        this._License = {
            adapt: false,
            diminish: false,
            embed: false,
            enhance: false,
            enlarge: false,
            issue: false,
            modify: false,
            play: false,
            print: false,
            reduce: false
        }
        for (let i = 0; i < source.value.length; i++) {
            this._License[source.value[i]] = true;
        }
    }

    sellLicense(seller: string, buyer: string) {
        this.loading = true;
        let userSeller = this.getUserInfo(seller);
        let userBuyer = this.getUserInfo(buyer);
        let request = new SellLicenseRequest();
        let hash;
        let channel = this.isNewChannel ? userSeller.userName + '-stonehenge' : this.currentChannel;
        console.log('test')
        this.hashService.putMetadata(channel).toPromise().then(() => {
            return this.hashService.getHash().toPromise();
        }).then(res => {
            hash = res.hash;
        }).then(() => {
            if (this.isNewChannel) {
                console.log('isnewChannel')
                let request: InheritHistoryRequest = {
                    buyer: userBuyer,
                    seller: userSeller,
                    child: channel,
                    parent: this.currentChannel,
                    image: 'stonehenge',
                };
                return this.fabricService.inheritHistory(request).toPromise();
            } else {
                return new Promise((resolve, reject) => {
                    console.log('isNotNewChannel')
                    let res = {
                        queryResponse: ''
                    }
                    resolve(res);
                });
            }
        }).then(res => {
            console.log(res)
            this.history = res.queryResponse;
        }).then(() => {
            let transaction: Transaction = {
                idImage: 'stonehenge',
                hashImage: hash,
                newOwner: userBuyer.userName,
                license: this._License
            };
            request = {
                seller: userSeller,
                buyer: userBuyer,
                channel: channel,
                transaction: JSON.stringify(transaction)
            };
            console.log(request)
            this.fabricService.sellLicense(request)
                .subscribe(res => {
                    this.fabricService.getChannels(userSeller).toPromise().then(response => {
                        this.channels = response.channels;
                        this.currentChannel = this.channels ? this.channels[0] : undefined;
                        this.loading = false;
                        this.openSnackBar();
                    })
                })
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
                this.history = res.queryResponse;
            })
    }

    selected(sell: string) {
        console.log(this.isNewChannel)
        let seller = this.getUserInfo(sell);
        this.fabricService.getChannels(seller).toPromise().then(response => {
            this.channels = response.channels;
            this.currentChannel = this.channels ? this.channels[0] : undefined;
        })
    }

    newCurrentChannel(event) {
        this.currentChannel = event.value;
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