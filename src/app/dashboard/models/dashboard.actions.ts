export enum DashboardActionTypes {
    START_GAME = '[Dashboard] Start Game',
    SELECT_SHIP = '[Dashboard] Select Ship',
    UPDATE_LEVEL = '[Dashboard] Update Level',
    LOGOUT = '[Dashboard] Logout'
}

export interface DashboardAction {
    type: DashboardActionTypes;
    payload?: any;
} 