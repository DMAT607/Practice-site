import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SignupForm } from 'src/app/types/Signup';
import { RouterLink } from '@angular/router';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  if (!password || !confirm) return null;

  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  constructor(public auth: AuthService) {}

  form = new FormGroup<SignupForm>(
    {
      full_name: new FormControl('John Doe', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      mobile: new FormControl('1234567890', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern('^\\d{10}$')],
      }),
      email: new FormControl('john.doe@example.com', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('password123', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('password123', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator }
  );

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.signup(this.form.getRawValue());
  }
}
