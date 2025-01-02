import { Component } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  coverImage: string = '../../../assets/images/proplayershero.svg'; // Default cover image
  profileImage: string = '../../assets/images/user.png'; // Default profile image

  userData = {
    name: 'GIO',
    email: 'gio@gmail.com'
  };

  // Cover image logic
  triggerFileUpload(): void {
    const fileInput = document.getElementById('coverImageInput') as HTMLInputElement;
    fileInput.click();
  }

  onCoverImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverImage = e.target.result; // Update the cover image dynamically
      };
      reader.readAsDataURL(input.files[0]); // Convert the uploaded file to a data URL
    }
  }

  // Profile image logic
  triggerProfileUpload(): void {
    const fileInput = document.getElementById('profileImageInput') as HTMLInputElement;
    fileInput.click();
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result; // Update the profile image dynamically
      };
      reader.readAsDataURL(input.files[0]); // Convert the uploaded file to a data URL
    }
  }
}
