#!/usr/bin/env node

/**
 * MCP Agent Executor for Playwright Tests
 * Uses the agent.md configuration to generate tests
 */

const fs = require('fs');
const path = require('path');

class MCPAgentExecutor {
  constructor() {
    this.agentConfig = this.loadAgentConfig();
    this.settings = this.loadSettings();
  }

  loadAgentConfig() {
    const agentPath = path.join(__dirname, '.mcp', 'agent.md');
    return fs.readFileSync(agentPath, 'utf8');
  }

  loadSettings() {
    const settingsPath = path.join(__dirname, '.mcp', 'settings.json');
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }

  generatePrompt(userRequest) {
    return `
${this.agentConfig}

---

## Project Context
- Project: ${this.settings.projectName}
- Base URL: ${this.settings.baseUrl}
- Test Directory: ${this.settings.defaultTestDirectory}
- Use Data-TestId Only: ${this.settings.useDataTestIdOnly}
- Enforce POM: ${this.settings.enforcePageObjectModel}

---

## User Request
${userRequest}

---

## Instructions
Based on the agent configuration above and the project context, generate the requested Playwright tests following all the specified guidelines, best practices, and restrictions.

Generate:
1. Test scenarios
2. Page Object updates (if needed)
3. Complete test implementation
4. Execution instructions
`;
  }

  async executeRequest(userRequest) {
    const prompt = this.generatePrompt(userRequest);
    
    console.log('\n🤖 MCP Agent Prompt Generated:');
    console.log('='.repeat(80));
    console.log(prompt);
    console.log('='.repeat(80));
    console.log('\n📋 Instructions:');
    console.log('1. Copy the prompt above');
    console.log('2. Send it to your AI assistant (Claude, ChatGPT, etc.)');
    console.log('3. The AI will generate tests following your MCP configuration');
    console.log('4. Save the generated tests in the suggested directory');
    console.log('\n✅ Your MCP Agent is ready to generate tests!');
    
    return prompt;
  }
}

// CLI Usage
if (require.main === module) {
  const userRequest = process.argv.slice(2).join(' ');
  
  if (!userRequest) {
    console.log(`
🤖 MCP Agent Executor Usage:

node mcp-executor.js "Generate tests for dish creation flow"
node mcp-executor.js "Create navigation tests with error handling"
node mcp-executor.js "Generate authentication tests for login and register"

Examples:
  node mcp-executor.js "Generate comprehensive tests for the dishes CRUD functionality"
  node mcp-executor.js "Create exploratory tests for user registration flow"
    `);
    process.exit(1);
  }

  const executor = new MCPAgentExecutor();
  executor.executeRequest(userRequest);
}

module.exports = MCPAgentExecutor;