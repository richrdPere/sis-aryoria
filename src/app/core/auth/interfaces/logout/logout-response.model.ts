import { ApiResponse } from "src/app/core/interfaces/api-response.model";

export interface LogoutData {
  session_closed: boolean;
  already_closed: boolean;
}

export type LogoutResponse = ApiResponse<LogoutData>;
