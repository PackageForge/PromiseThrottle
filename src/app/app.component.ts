import { Component, OnInit } from '@angular/core';
import { PromiseThrottle } from 'projects/promise-throttle/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public numOpen=0;
  public numQueued=0;
  public intervalLow=1;
  public intervalHigh=100;
  public durationLow=1;
  public durationHigh=1000;
  public throttle=new PromiseThrottle(5);

  constructor(){
  }
  
  ngOnInit(): void {
    this.digest();
  }

  digest(){
    setTimeout(()=>{
      this.numQueued++;
      this.throttle.add(()=>this.addOne().then(()=>{
        this.numOpen--;
      }));
      this.digest();
    },this.randomInterval());
  }
  private addOne(){
    this.numOpen++;
    this.numQueued--;
    return new Promise(res=>{
      setTimeout(res,this.randomDuration());
    });
  }
  private randomInterval(){
    return Math.random()*(this.intervalHigh-this.intervalLow)+this.intervalLow;
  }
  private randomDuration(){
    return Math.random()*(this.durationHigh-this.durationLow)+this.durationLow;
  }
}
