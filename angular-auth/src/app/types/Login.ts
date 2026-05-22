import { FormControl } from "@angular/forms";

export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
};

export interface User {
    id: string;
    email: string;
};

export interface LoginResponse {
    success: boolean;
    accessToken: string;
    user: {
      id: string,
      email: string
    }
}