import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Logger } from 'angular2-logger/core';
import { Observable } from 'rxjs';

import { Endpoint } from '../models/endpoint/endpoint.model';
import { EndpointService } from '../models/endpoint/endpoint.service';
import { Helpers } from '../shared/helpers';

export interface IServerStatus {
  hours?: string;
  minutes?: string;
  seconds?: number;
  status: string;
  players: number;
}

export interface IServerStatusXMLData {
  eveapi: {
    currentTime: [string];
    result: [{
      serverOpen: [string];
      onlinePlayers: [number];
    }];
  };
}

@Injectable()
export class ClockService {

  public static tickTime(time: IServerStatus): IServerStatus {
    let h: any = parseInt(time.hours, 10);
    let m: any = parseInt(time.minutes, 10);
    m += 1;
    if (m === 60) {
      h += 1;
      m = 0;
    }
    if (m < 10) {
      m = '0' + m.toString();
    }
    if (h === 24) {
      h = 0;
    }
    if (h < 10) {
      h = '0' + h.toString();
    }
    return {
      hours: h,
      minutes: m,
      players: time.players,
      status: time.status,
    };
  }

  private static processTime(jsonData: IServerStatusXMLData): IServerStatus {
    const currentTime = jsonData.eveapi.currentTime[0];
    let hours: any = parseInt(currentTime.slice(-8, -6), 10);
    let minutes: any = parseInt(currentTime.slice(-5, -3), 10);
    const seconds = parseInt(currentTime.slice(-2), 10);
    let status = jsonData.eveapi.result[0].serverOpen[0];
    const players = jsonData.eveapi.result[0].onlinePlayers[0];

    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    } else if (minutes < 10) {
      minutes = '0' + minutes.toString();
    }
    if (hours === 24) {
      hours = 0;
    } else if (hours < 10) {
      hours = hours.toString();
      hours = '0' + hours;
    }
    if (status === 'True') {
      status = 'Online';
    } else {
      status = 'Offline';
    }

    return {
      hours,
      minutes,
      players,
      seconds,
      status,
    };
  }

  private endpoint: Endpoint;

  constructor(private http: Http, private endpointService: EndpointService, private helpers: Helpers, private logger: Logger) {
    this.endpoint = this.endpointService.getEndpoint('ServerStatus');
  }

  public getTime(): Observable<object> {
    const url = this.endpointService.constructXMLUrl(this.endpoint, [], false);
    const headers = new Headers();
    headers.append('Accept', 'application/xml');
    return this.http.get(url, {headers}).map((response: Response) => {
      const jsonData = this.helpers.processXML(response) as IServerStatusXMLData;
      return ClockService.processTime(jsonData);
    }).catch((error) => {
      this.logger.error(error);
      return Observable.of({
        players: 0,
        status: 'Offline',
      });
    });
  }
}

// try {
//
//   response = await this.http.get(url, {headers: headers}).toPromise().catch((error) => {
//     throw new Error(error);
//   });
//
//   if (!response.ok || response.status !== 200) {
//     this.logger.error('Response was not OK', response);
//     return [];
//   }
//
//   const orders: Array<OrderData> = response.json();
//
//   // if (!(shipData.ship_type_id && shipData.ship_name)) {
//   //   this.logger.error('Data did not contain expected values', shipData);
//   //   return {id: -1, name: 'Error'};
//   // }
//   //
//   // return {
//   //   id: shipData.ship_type_id,
//   //   name: shipData.ship_name,
//   // };
//   return orders;
//
// } catch (err) {
//   this.logger.error(err);
//   return [];
// }
