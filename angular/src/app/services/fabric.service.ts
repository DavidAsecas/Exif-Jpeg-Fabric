import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SellLicenseRequest } from '../interfaces/sellLicenseRequest';
import { GetHistoryRequest } from '../interfaces/getHistoryRequest';

@Injectable({
    providedIn: 'root'
})
export class FabricService {

    private queryUrl = 'http://localhost:3000/api/getHistory';
    private transactionUrl = 'http://localhost:3000/api/sellLicense'

    constructor(private http: HttpClient) { }

    sellLicense(request: SellLicenseRequest): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.post(this.transactionUrl, JSON.stringify(request), {
            headers: headers
        });
    }

    getHistory(request: GetHistoryRequest): Observable<any>{
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.get(this.queryUrl, {
            headers: headers,
            params: {
                request: JSON.stringify(request)
            }
        });
    }
}