import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/auth/auth.service';
import { HomeService } from 'src/app/core/home/home.service';
import { FormsModule } from '@angular/forms';
import { Player } from 'src/app/types/Home';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(
    public auth: AuthService,
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {}

  players = this.homeService.playerList;
  loading = this.homeService.loadingList;
  totalCount: any = this.homeService.totalCount;
  deletingPlayer = this.homeService.deletingPlayer;

  selectedPlayer: Player | null = null;
  showDeleteModal = false;

  pagination = {
    currentPage: 1,
    pageSize: 5,
    sortBy: '',
    sortDir: 'asc',
  };

  get totalPages() {
    return Math.ceil((this.totalCount() || 0) / this.pagination.pageSize);
  }

  ngOnInit() {
    this.homeService.getPlayers(this.pagination).subscribe();
    this.getUserDetails();
  }

  getUserDetails() {
    this.homeService.getUserDetails();
  }

  logout() {
    this.auth.logout();
  }

  toggleSortDirection() {
    this.pagination.sortDir =
      this.pagination.sortDir === 'asc' ? 'desc' : 'asc';
    this.handleSort();
  }

  handlePagination(dir: 'next' | 'prev' | 'first' | 'last') {
    if (dir === 'next' || dir === 'prev') {
      if (dir === 'next') {
        this.pagination.currentPage++;
        this.homeService.getPlayers(this.pagination).subscribe();
        return;
      }
      this.pagination.currentPage--;
      this.homeService.getPlayers(this.pagination).subscribe();
      return;
    }
    if (dir === 'first') {
      this.pagination.currentPage = 1;
      this.homeService.getPlayers(this.pagination).subscribe();
      return;
    }
    this.pagination.currentPage = this.totalPages;
    this.homeService.getPlayers(this.pagination).subscribe();
    return;
  }

  handlePageSize() {
    this.pagination.currentPage = 1;
    this.homeService.getPlayers(this.pagination).subscribe();
  }

  handleSort() {
    if (!this.pagination.sortBy) {
      this.pagination.sortDir = 'asc';
    }
    this.homeService.getPlayers(this.pagination).subscribe();
  }

  openDeleteModal(player: any) {
    this.selectedPlayer = player;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.selectedPlayer = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.selectedPlayer) return;
    try {
      this.homeService.deletePlayer(this.selectedPlayer.id).subscribe({
        next: () => {
          this.homeService.getPlayers(this.pagination).subscribe();
          this.toastr.success('Player deleted successfully');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to delete player');
          this.closeDeleteModal();
        },
      });
    } catch (err) {
      this.toastr.error('Failed to delete player');
      console.error('Failed to delete player:', err);
    }
  }
}
