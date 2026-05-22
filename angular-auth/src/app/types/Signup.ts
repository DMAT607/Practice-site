import { FormControl } from "@angular/forms";

export interface SignupResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        created_at: string;
        full_name: string;
        mobile: string;
    };
    error?: string;
    message?: string;
}

export interface SignupForm {
  full_name: FormControl<string>;
  mobile: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

export interface SignupPayload {
  full_name: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
};