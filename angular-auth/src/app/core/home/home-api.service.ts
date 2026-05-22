import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayersListResponse } from 'src/app/types/Home';

@Injectable({
  providedIn: 'root',
})
export class HomeApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPlayersList(pagination: any) {
    return this.http.post<PlayersListResponse>(`${this.baseUrl}/home/players_list`, pagination);
  }

  getUserDetails() {
    return this.http.get(`${this.baseUrl}/home/user_details`, {
      withCredentials: true,
    });
  }

  deleteUser(playerId: number) {
    return this.http.post(`${this.baseUrl}/home/delete_player`,{ playerId } , {
      withCredentials: true,
    });
  }
}
