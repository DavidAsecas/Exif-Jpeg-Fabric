import { Component, OnInit } from '@angular/core';
import { FabricService } from '../services/fabric.service';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { User } from '../interfaces/user';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';
import { Transaction, License } from '../interfaces/transaction';
import { ImageService } from '../services/hash.service';
import { InheritHistoryRequest } from '../interfaces/inheritHistory';
import { JsonPipe } from '@angular/common';
import { reject } from 'q';

@Component({
    selector: 'pm-block',
    templateUrl: './blockchain.component.html'
})
export class BlockchainComponent implements OnInit {

    private _License: License;
    public get License(): License {
        return this._License;
    }
    public set License(v: License) {
        this._License = v;
    }
    history: any[];
    channels: string[];
    currentChannel: string;
    dropdownList = [];
    dropdownSettings = {};
    isNewChannel = true;

    constructor(private fabricService: FabricService, private imageService: ImageService) { }

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
        this.dropdownList = [
            { item_id: 1, item_text: "adapt" },
            { item_id: 2, item_text: "diminish" },
            { item_id: 3, item_text: "embed" },
            { item_id: 4, item_text: "enhance" },
            { item_id: 5, item_text: "enlarge" },
            { item_id: 6, item_text: "issue" },
            { item_id: 7, item_text: "modify" },
            { item_id: 8, item_text: "play" },
            { item_id: 9, item_text: "print" },
            { item_id: 10, item_text: "reduce" },
        ]
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            itemsShowLimit: 5,
            allowSearchFilter: false,
            enableCheckAll: false
        };
        this.onUserChange('user1');
    }

    onItemSelect(item: any) {
        this._License[item.item_text] = true;
    }

    onItemDeselect(item: any) {
        this._License[item.item_text] = false;
    }

    sellLicense(seller: string, buyer: string) {
        let userSeller = this.getUserInfo(seller);
        let userBuyer = this.getUserInfo(buyer);
        let request = new SellLicenseRequest();
        let hash;
        let channel = this.isNewChannel ? userSeller.userName + '-stonehenge' : this.currentChannel;
        this.imageService.putMetadata(channel).toPromise().then(res => {
        }).then(() => {
            return this.imageService.getHash().toPromise();
        }).then(res => {
            hash = res.hash;
        }).then(() => {
            if (this.isNewChannel) {
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
                    let res = {
                        queryResponse: ''
                    }
                    resolve(res);
                });
            }
        }).then(res => {
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
            this.fabricService.sellLicense(request)
                .subscribe(res => {
                    this.fabricService.getChannels(userSeller).toPromise().then(response => {
                        this.channels = response.channels;
                        this.currentChannel = this.channels ? this.channels[0] : undefined;
                    })
                    console.log(res.message);
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

    onUserChange(sell: string) {
        let seller = this.getUserInfo(sell);
        this.fabricService.getChannels(seller).toPromise().then(response => {
            this.channels = response.channels;
            this.currentChannel = this.channels ? this.channels[0] : undefined;
        })
    }

    newCurrentChannel(event) {
        this.currentChannel = event.target.value;
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