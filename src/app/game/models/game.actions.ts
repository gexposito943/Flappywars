export enum GameActionTypes {
    START_GAME = '[Game] Start Game',
    STOP_GAME = '[Game] Stop Game',
    TOGGLE_PAUSE = '[Game] Toggle Pause',
    JUMP = '[Game] Jump',
    UPDATE_SCORE = '[Game] Update Score',
    NAVIGATE_DASHBOARD = '[Game] Navigate Dashboard'
}

export interface GameAction {
    type: GameActionTypes;
    payload?: any;
} 