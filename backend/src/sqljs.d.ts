declare module 'sql.js' {
  export default function initSqlJs(): Promise<any>;
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): any[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }
  export interface Statement {
    bind(params: any[]): void;
    step(): boolean;
    getAsObject(): any;
    free(): void;
  }
}
