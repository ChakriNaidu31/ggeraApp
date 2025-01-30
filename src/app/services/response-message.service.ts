import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponseMessageService {

  private chosenGame: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public chosenGameData: Observable<string> = this.chosenGame.asObservable();

  constructor(private toastr: ToastrService) { }

  setGame(data: string) {
    this.chosenGame.next(data);
  }

  showSuccess(message: string, title: string, params?: { duration?: number, closeButton?: boolean, enableHtml?: boolean }) {
    this.toastr.success(message, title, {
      timeOut: params?.duration ? params?.duration : 10000,
      closeButton: params?.closeButton ? params?.closeButton : false,
      enableHtml: params?.enableHtml ? params?.enableHtml : false
    });
  }

  showError(message: string, title: string, params?: { duration?: number, closeButton?: boolean, enableHtml?: boolean }) {
    this.toastr.error(message, title, {
      timeOut: params?.duration ? params?.duration : 10000,
      closeButton: params?.closeButton ? params?.closeButton : false,
      enableHtml: params?.enableHtml ? params?.enableHtml : false
    });
  }

  showWarning() {
    this.toastr.warning('Warning!', 'Important notification!');
  }

  showInfo() {
    this.toastr.info('Just a simple info message.', 'Info!');
  }

}
