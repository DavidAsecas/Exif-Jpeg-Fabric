import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';
import { User } from '../interfaces/user';
import { InheritHistoryRequest } from '../interfaces/inheritHistoryRequest';
import { timeout } from "rxjs/operators"

@Injectable({
    providedIn: 'root'
})
export class FabricService {

    private queryUrl = 'http://localhost:3000/api/getHistory';
    private transactionUrl = 'http://localhost:3000/api/sellLicense'
    private getChannelsUrl = 'http://localhost:3000/api/getChannels';
    private inheritHistoryUrl = 'http://localhost:3000/api/inheritHistory';

    constructor(private http: HttpClient) { }

    sellLicense(request: SellLicenseRequest): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.post(this.transactionUrl, JSON.stringify(request), {
            headers: headers
        }).pipe(timeout(60000))
    }

    getHistory(request: GetHistoryRequest): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.get(this.queryUrl, {
            headers: headers,
            params: {
                request: JSON.stringify(request)
            }
        });
    }

    getChannels(user: User): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.get(this.getChannelsUrl, {
            headers: headers,
            params: {
                user: JSON.stringify(user)
            }
        });
    }

    inheritHistory(request: InheritHistoryRequest): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.post(this.inheritHistoryUrl, JSON.stringify(request), {
            headers: headers
        }).pipe(timeout(60000));
    }
}