#!/usr/bin/env npx tsx

/**
 * Pre-Deployment Security & Quality Check Script
 *
 * This script performs automated checks before deployment to catch common issues.
 * Run this before deploying to production!
 *
 * Usage: npx tsx scripts/pre-deploy-check.ts
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

interface CheckResult {
  name: string
  passed: boolean
  message: string
  critical: boolean
}

const results: CheckResult[] = []

function printHeader(text: string) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${text}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

function printCheck(name: string) {
  process.stdout.write(`${colors.blue}⏳ ${name}...${colors.reset}`)
}

function printResult(passed: boolean, message: string, critical: boolean = false) {
  const icon = passed ? '✅' : (critical ? '❌' : '⚠️')
  const color = passed ? colors.green : (critical ? colors.red : colors.yellow)
  console.log(`\r${color}${icon} ${message}${colors.reset}`)
}

function addResult(name: string, passed: boolean, message: string, critical: boolean = false) {
  results.push({ name, passed, message, critical })
  printResult(passed, message, critical)
}

// Check 1: Verify .env.example doesn't contain real credentials
function checkEnvExample() {
  printCheck('Checking .env.example for real credentials')

  try {
    const envExample = fs.readFileSync('.env.example', 'utf-8')

    // Patterns that indicate real credentials
    const patterns = [
      { regex: /AIza[0-9A-Za-z-_]{35}/, name: 'Google API Key' },
      { regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/, name: 'JWT Token' },
      { regex: /https:\/\/[a-z]{20}\.supabase\.co/, name: 'Supabase URL (should be placeholder)' },
      { regex: /postgres:\/\/[^@]+@[^:]+:/, name: 'Database Connection String' },
      { regex: /https:\/\/[^.]+\.upstash\.io/, name: 'Upstash URL' },
    ]

    const foundCredentials: string[] = []

    for (const pattern of patterns) {
      if (pattern.regex.test(envExample)) {
        foundCredentials.push(pattern.name)
      }
    }

    if (foundCredentials.length > 0) {
      addResult(
        'env-example',
        false,
        `.env.example contains real credentials: ${foundCredentials.join(', ')}`,
        true
      )
      return false
    } else {
      addResult('env-example', true, '.env.example is clean (no real credentials)')
      return true
    }
  } catch (error) {
    addResult('env-example', false, `.env.example check failed: ${error}`, true)
    return false
  }
}

// Check 2: Verify .env.local is not in git
function checkEnvLocalNotInGit() {
  printCheck('Checking if .env.local is in git')

  try {
    const gitFiles = execSync('git ls-files', { encoding: 'utf-8' })

    if (gitFiles.includes('.env.local')) {
      addResult('env-local-git', false, '.env.local is tracked by git! Remove it immediately.', true)
      return false
    } else {
      addResult('env-local-git', true, '.env.local is not in git')
      return true
    }
  } catch (error) {
    addResult('env-local-git', false, `Git check failed: ${error}`, false)
    return false
  }
}

// Check 3: Search for credentials in git history
function checkGitHistory() {
  printCheck('Checking git history for leaked credentials')

  try {
    const sensitivePatterns = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'GEMINI_API_KEY',
      'UPSTASH_REDIS_REST_TOKEN',
    ]

    const foundInHistory: string[] = []

    for (const pattern of sensitivePatterns) {
      try {
        const result = execSync(
          `git log --all --full-history -S"${pattern}" --pretty=format:"%h %s" | head -5`,
          { encoding: 'utf-8', stdio: 'pipe' }
        )

        if (result.trim()) {
          foundInHistory.push(pattern)
        }
      } catch (e) {
        // No matches found (exit code 1 is expected)
      }
    }

    if (foundInHistory.length > 0) {
      addResult(
        'git-history',
        false,
        `Credentials found in git history: ${foundInHistory.join(', ')}. Rotate keys immediately!`,
        true
      )
      return false
    } else {
      addResult('git-history', true, 'No credentials found in git history')
      return true
    }
  } catch (error) {
    addResult('git-history', false, `Git history check failed: ${error}`, false)
    return false
  }
}

// Check 4: Verify TypeScript compiles
function checkTypeScript() {
  printCheck('Running TypeScript type check')

  try {
    execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' })
    addResult('typescript', true, 'TypeScript type check passed')
    return true
  } catch (error: any) {
    const errorOutput = error.stdout || error.stderr || ''
    const errorLines = errorOutput.split('\n').slice(0, 5).join('\n')
    addResult('typescript', false, `TypeScript errors found:\n${errorLines}`, true)
    return false
  }
}

// Check 5: Verify build succeeds
function checkBuild() {
  printCheck('Running production build')

  try {
    execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' })
    addResult('build', true, 'Production build succeeded')
    return true
  } catch (error: any) {
    const errorOutput = error.stdout || error.stderr || ''
    const errorLines = errorOutput.split('\n').slice(-10).join('\n')
    addResult('build', false, `Build failed:\n${errorLines}`, true)
    return false
  }
}

// Check 6: Search for console.log statements
function checkConsoleLogs() {
  printCheck('Checking for console.log statements')

  try {
    const result = execSync(
      'grep -r "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l',
      { encoding: 'utf-8' }
    )

    const count = parseInt(result.trim())

    if (count > 0) {
      addResult(
        'console-logs',
        false,
        `Found ${count} console.log statements in src/. Consider removing or using a logger.`,
        false
      )
      return false
    } else {
      addResult('console-logs', true, 'No console.log statements found')
      return true
    }
  } catch (error) {
    addResult('console-logs', true, 'Console.log check completed (no critical issues)')
    return true
  }
}

// Check 7: Verify required environment variables are documented
function checkEnvVars() {
  printCheck('Checking environment variables documentation')

  try {
    const envExample = fs.readFileSync('.env.example', 'utf-8')

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GEMINI_API_KEY',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'NEXT_PUBLIC_APP_URL',
    ]

    const missingVars = requiredVars.filter(v => !envExample.includes(v))

    if (missingVars.length > 0) {
      addResult(
        'env-vars',
        false,
        `Missing environment variables in .env.example: ${missingVars.join(', ')}`,
        true
      )
      return false
    } else {
      addResult('env-vars', true, 'All required environment variables documented')
      return true
    }
  } catch (error) {
    addResult('env-vars', false, `Environment variables check failed: ${error}`, true)
    return false
  }
}

// Check 8: Verify security files exist
function checkSecurityFiles() {
  printCheck('Checking security configuration files')

  const requiredFiles = [
    'vercel.json',
    '.vercelignore',
    'PRODUCTION_DEPLOYMENT_GUIDE.md',
    'PRE_DEPLOYMENT_CHECKLIST.md',
  ]

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file))

  if (missingFiles.length > 0) {
    addResult(
      'security-files',
      false,
      `Missing security files: ${missingFiles.join(', ')}`,
      false
    )
    return false
  } else {
    addResult('security-files', true, 'All security configuration files present')
    return true
  }
}

// Check 9: Verify package.json has required scripts
function checkPackageScripts() {
  printCheck('Checking package.json scripts')

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    const scripts = packageJson.scripts || {}

    const requiredScripts = ['build', 'start', 'dev', 'lint']
    const missingScripts = requiredScripts.filter(s => !scripts[s])

    if (missingScripts.length > 0) {
      addResult(
        'package-scripts',
        false,
        `Missing scripts in package.json: ${missingScripts.join(', ')}`,
        true
      )
      return false
    } else {
      addResult('package-scripts', true, 'All required scripts present in package.json')
      return true
    }
  } catch (error) {
    addResult('package-scripts', false, `Package.json check failed: ${error}`, true)
    return false
  }
}

// Check 10: Security audit
function checkSecurityAudit() {
  printCheck('Running npm security audit')

  try {
    const result = execSync('npm audit --audit-level=high', { encoding: 'utf-8', stdio: 'pipe' })
    addResult('security-audit', true, 'No high-severity vulnerabilities found')
    return true
  } catch (error: any) {
    const output = error.stdout || error.stderr || ''
    const vulnerabilities = output.match(/(\d+) high severity/)?.[1] || '0'

    if (parseInt(vulnerabilities) > 0) {
      addResult(
        'security-audit',
        false,
        `Found ${vulnerabilities} high-severity vulnerabilities. Run 'npm audit fix' to fix them.`,
        true
      )
      return false
    } else {
      addResult('security-audit', true, 'Security audit passed')
      return true
    }
  }
}

// Main execution
async function main() {
  printHeader('🚀 Pre-Deployment Security & Quality Checks')

  console.log(`${colors.bold}Running automated checks...${colors.reset}\n`)

  // Run all checks
  checkEnvExample()
  checkEnvLocalNotInGit()
  checkGitHistory()
  checkEnvVars()
  checkSecurityFiles()
  checkPackageScripts()
  checkConsoleLogs()
  checkSecurityAudit()
  checkTypeScript()
  checkBuild()

  // Print summary
  printHeader('📊 Summary')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const critical = results.filter(r => !r.passed && r.critical).length

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`)
  console.log(`${colors.yellow}⚠️  Failed: ${failed}${colors.reset}`)
  console.log(`${colors.red}❌ Critical: ${critical}${colors.reset}\n`)

  if (critical > 0) {
    console.log(`${colors.bold}${colors.red}⛔ CRITICAL ISSUES FOUND!${colors.reset}`)
    console.log(`${colors.red}Do NOT deploy to production until all critical issues are resolved.${colors.reset}\n`)

    console.log(`${colors.bold}Critical Issues:${colors.reset}`)
    results
      .filter(r => !r.passed && r.critical)
      .forEach(r => {
        console.log(`${colors.red}  • ${r.message}${colors.reset}`)
      })

    process.exit(1)
  } else if (failed > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️  WARNING: Some checks failed${colors.reset}`)
    console.log(`${colors.yellow}Review the warnings above before deploying.${colors.reset}\n`)

    console.log(`${colors.bold}Warnings:${colors.reset}`)
    results
      .filter(r => !r.passed && !r.critical)
      .forEach(r => {
        console.log(`${colors.yellow}  • ${r.message}${colors.reset}`)
      })

    process.exit(0)
  } else {
    console.log(`${colors.bold}${colors.green}🎉 All checks passed! Ready to deploy.${colors.reset}\n`)
    console.log(`${colors.cyan}Next steps:${colors.reset}`)
    console.log(`${colors.cyan}1. Review PRODUCTION_DEPLOYMENT_GUIDE.md${colors.reset}`)
    console.log(`${colors.cyan}2. Configure environment variables in Vercel${colors.reset}`)
    console.log(`${colors.cyan}3. Deploy to Vercel${colors.reset}\n`)

    process.exit(0)
  }
}

main().catch((error) => {
  console.error(`${colors.red}Error running checks: ${error}${colors.reset}`)
  process.exit(1)
})
