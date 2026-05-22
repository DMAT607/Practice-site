import { Injectable, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HomeApiService } from './home-api.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { Player, PlayersListResponse } from 'src/app/types/Home';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(
    private api: HomeApiService,
    private toastr: ToastrService,
  ) {}

  private _playerList = signal<Player[]>([]);
  private _totalCount = signal<number>(0);
  private _loadingList = signal(false);
  private _deletingPlayer = signal(false);

  playerList = this._playerList.asReadonly();
  loadingList = this._loadingList.asReadonly();
  totalCount = this._totalCount.asReadonly();
  deletingPlayer = this._deletingPlayer.asReadonly();

  getPlayers(pagination: any) {
    this._loadingList.set(true);
    return this.api.getPlayersList(pagination).pipe(
      tap((res: PlayersListResponse) => {
        this._totalCount.set(res.total_count)
        this._playerList.set(res.players);
      }),
      catchError((err) => {
        this.toastr.error(err?.error?.message || 'Failed to fetch player list');
        return of([]);
      }),
      finalize(() => this._loadingList.set(false)),
    );
  }

  getUserDetails() {
    this._loadingList.set(true);
    return this.api
      .getUserDetails()
      .pipe(finalize(() => this._loadingList.set(false)))
      .subscribe({
        next: () => {
          // this._userList.set(response as any[]);
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to fetch user list');
        },
      });
  }

  deletePlayer(playerId: number) {
    this._deletingPlayer.set(true);
    return this.api.deleteUser(playerId).pipe(
      finalize(() => this._deletingPlayer.set(false))
    );
  }
}
