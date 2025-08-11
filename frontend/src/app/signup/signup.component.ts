import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { API_URL } from '../../constants';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  username = '';
  fullname = '';
  email = '';
  password = '';
  phone = '';
  gender = 'Khác';
  nationality = '';
  role = 'USER'; // default
  status = 'Active'; // default

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const payload = {
      username: this.username,
      fullName: this.fullname,
      password: this.password,
      phone: this.phone,
      email: this.email,
      gender: this.gender,
      nationality: this.nationality,
      role: this.role,
      status: this.status,
    };

    this.http.post(`${API_URL}/api/users`, payload).subscribe({
      next: () => {
        alert('Account created successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err?.error?.message || 'Signup failed!');
      },
    });
  }
}
