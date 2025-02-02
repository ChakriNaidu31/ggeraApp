import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ProUser } from 'src/app/models/pro-user';
import { AuthService } from 'src/app/services/auth.service';
declare var bootstrap: any;
@Component({
  selector: 'app-elite-orders-inprogress',
  templateUrl: './elite-orders-inprogress.component.html',
  styleUrls: ['./elite-orders-inprogress.component.css']
})
export class EliteOrdersInprogressComponent implements OnInit {
  userType: string = '';
   form: UntypedFormGroup;
   proUsers: ProUser[] = [];
    selectedProUsers: ProUser[] = [];
    timer: any;
  constructor( private _auth: AuthService,private title: Title,
    private meta: Meta,) { }

  ngOnInit(): void {
    this.userType = this._auth.getUserTypeFromSession();
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 10000);
  }
  setMetaInfo(category: string) {
    if (category === 'all') {
      this.title.setTitle("GGera - All Players");
      this.meta.updateTag({
        name: 'description',
        content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
      });
    } else if (category === 'online') {
      this.title.setTitle("GGera - Online Players");
      this.meta.updateTag({
        name: 'description',
        content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
      });
    } else if (category === 'offline') {
      this.title.setTitle("GGera - Offline Players ");
      this.meta.updateTag({
        name: 'description',
        content: 'GGera is the perfect place for gamers to come together and have an amazing time. Whether you\'re a casual or competitive player, Join our online pro players'
      });
    }
  }
  getData() {
debugger
    let filterData = [];
    if (this.form.controls['typePs'].value === true) {
      filterData.push('PS');
    }
    if (this.form.controls['typeXbox'].value === true) {
      filterData.push('XBOX');
    }
    if (this.form.controls['typePc'].value === true) {
      filterData.push('PC');
    }

    this._auth.fetchProUsers(filterData).subscribe((data) => {
      this.proUsers = data?.data;
      this.filterData();
    });
  }

  openPro(): void {
    const modalId = 'proModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }
 filterData(): void {
  this.getData()
    const selectedUserType = this.form.controls['type'].value;
    this.setMetaInfo(selectedUserType ? selectedUserType.toLowerCase() : 'all');
    let selectedProUsersLocal: ProUser[] = [];

    switch (selectedUserType) {
      case 'ALL': {
        selectedProUsersLocal = this.proUsers;
        break;
      }

      case 'ONLINE': {
        selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'ONLINE');
        break;
      }

      case 'BOOKED': {
        selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'BOOKED');
        break;
      }

      case 'OFFLINE': {
        selectedProUsersLocal = this.proUsers.filter(c => c.currentStatus === 'OFFLINE');
        break;
      }

      default: {
        selectedProUsersLocal = [];
        break;
      }
    }
    if (this.selectedProUsers.length !== selectedProUsersLocal.length) {
      this.selectedProUsers = selectedProUsersLocal;
    } else {
      for (let i = 0; i < selectedProUsersLocal.length; i++) {
        const currentProUser = selectedProUsersLocal[i];
        const oldProUserFiltered = this.selectedProUsers.filter(c => c?.id === currentProUser?.id);
        const oldProUser: ProUser | undefined = oldProUserFiltered?.length > 0 ? oldProUserFiltered[0] : undefined;
        if (!this.dataChanged(currentProUser, oldProUser)) {
          this.selectedProUsers = selectedProUsersLocal;
          break;
        }
      }
    }
  }

  private dataChanged(currentPro: ProUser, oldPro: ProUser | undefined) {

    return currentPro?.username === oldPro?.username &&
      currentPro?.currentStatus === oldPro?.currentStatus &&
      currentPro?.summary === oldPro?.summary &&
      currentPro?.kd === oldPro?.kd &&
      currentPro?.region === oldPro?.region &&
      currentPro?.rating === oldPro?.rating
  }

  cancel() {
    this.closeModal('proModal');
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

}
