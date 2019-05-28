import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class HashService {

    private getHashUrl = 'http://localhost:3000/api/getHash';
    private putMetadataUrl = 'http://localhost:3000/api/putMetadata';

    constructor(private http: HttpClient) { }

    getHash(): Observable<any> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'text/plain');
        return this.http.get(this.getHashUrl, {
            headers: headers
        });
    }

    putMetadata(channel: string): Observable<any> {
        let body = { channel: channel }
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');
        return this.http.post(this.putMetadataUrl, body, {
            headers: headers
        })
    }
}