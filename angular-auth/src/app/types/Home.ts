export interface Player {
    id: number;
    name: string;
    player_position: string;
    club: string;
    country: string;
    jersey_number: number;
    goals: number;
}

export interface PlayersListResponse {
    total_count: number;
    players: Player[];
}