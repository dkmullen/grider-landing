import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
;import { Observable, of } from 'rxjs';
import { map, switchMap, pluck, mergeMap, filter, toArray, share } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface OpenWeatherResponse {
  list: {
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    }
  }[]
}

interface OpenWeatherResponseCurrent {
  dt: number;
  sys: {
    sunrise: number,
    sunset: number,
  },
  main: {
    temp: number;
    humidity: number;
  },
  weather: {
    main: string
  },
  name: string
}


@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private url = 'https://api.openweathermap.org/data/2.5/forecast';
  private currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) { }

  getForecast() {
    return this.getCurrentLocation()
    .pipe(
      map(coords => {
        return new HttpParams()
          .set('lat', String(coords.latitude))
          .set('lon', String(coords.longitude))
          .set('units', 'imperial')
          .set('appid', environment.openWeatherKey)
      }),
      switchMap(params => this.http.get<OpenWeatherResponse>(this.url, { params })
      ),
      pluck('list'),
      mergeMap(value => of(...value)),
      filter((value, index) => index % 8 === 0),
      map(value => {
        return {
          dateString: value.dt_txt,
          temp: value.main.temp,
          humidity: value.main.humidity
        }
      }),
      toArray()
    )
  }

  getCurrentWeather() {
    return this.getCurrentLocation()
    .pipe(
      map(coords => {
        return new HttpParams()
          .set('lat', String(coords.latitude))
          .set('lon', String(coords.longitude))
          .set('cnt', '5')
          .set('units', 'imperial')
          .set('appid', environment.openWeatherKey)
      }),
      switchMap(params => this.http.get<OpenWeatherResponseCurrent>(this.currentWeatherUrl, { params })
      ),
      map(value => {
        return {
          date: value.dt,
          sunrise: value.sys.sunrise,
          sunset: value.sys.sunset,
          temp: value.main.temp,
          humidity: value.main.humidity,
          description: value.weather[0].main,
          location: value.name
        }
      }),
      toArray(),
      share() // Make it multicast - only one observable, shared by many subscriptions to it
    )
  }
  
  getCurrentLocation() {
    return new Observable<Coordinates>((observer) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position.coords);
          observer.complete();
        },
        (err) => observer.error(err)
        );
    });
  }
}
