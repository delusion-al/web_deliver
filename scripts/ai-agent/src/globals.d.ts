declare module 'open-multi-agent' {
  export class Coordinator {
    constructor(config: any);
    run(goal: string): Promise<{ finalAnswer: string }>;
  }
  export function defineTool(toolConfig: any): any;
}
