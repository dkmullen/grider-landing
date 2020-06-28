import { Component, OnInit } from '@angular/core';
import { ForecastService } from '../forecast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {
  forecast$: Observable<{dateString: string, temp: number, humidity: number}[]>;
  currentWeather$: Observable<{
    date: number, temp: number, sunrise: number, sunset: number, 
    humidity: number, description: string, location: string
  }[]>;
  sunrise: Date;
  sunset: Date;

  constructor(forcastService: ForecastService) {
    this.forecast$ = forcastService.getForecast();
    this.currentWeather$ = forcastService.getCurrentWeather();

    forcastService.getCurrentWeather().subscribe(res => {
      this.sunrise = new Date(res[0].sunrise * 1000);
      this.sunset = new Date(res[0].sunset * 1000);
    })

    forcastService.getForecast().subscribe(res => {
      console.log(res)
    })
   }

  ngOnInit() {

  }

}
