/**
 * Full-Stack API Cookbook Type Declarations
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'RESET';
  url: string;
  status: number | string; // e.g. 200, 201, "CORS ERR", "BLOCKED"
  title: string;
  sub: string;
  headers: Record<string, string>;
  reqBody?: any;
  resBody?: any;
  latency?: number;
  isError?: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface MockUser {
  username: string;
  role: string;
}
