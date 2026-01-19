#!/usr/bin/env node

/**
 * CLI tool to publish version by calling release-version.mjs and creating git tags.
 *
 * Usage:
 *   node scripts/publish-version.mjs <version>
 *
 * This script will:
 *   1. Call release-version.mjs to update all version files
 *   2. Create and push git tags for semver versions and alpha releases
 *
 * Examples:
 *   node scripts/publish-version.mjs 1.2.3      # Creates tag v1.2.3
 *   node scripts/publish-version.mjs v1.2.3     # Creates tag v1.2.3
 *   node scripts/publish-version.mjs alpha      # Creates tag v1.2.3-alpha
 *   node scripts/publish-version.mjs autobuild  # No tag created
 */

import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const scriptPath = path.join(rootDir, 'scripts', 'release-version.mjs')

if (!existsSync(scriptPath)) {
  console.error('release-version.mjs not found!')
  process.exit(1)
}

const versionArg = process.argv[2]
if (!versionArg) {
  console.error('Usage: pnpm publish-version <version>')
  process.exit(1)
}

// 1. 调用 release-version.mjs
function runRelease() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, versionArg], { stdio: 'inherit' })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error('release-version failed'))
    })
  })
}

// 2. 判断是否需要打 tag
function isSemver(version) {
  return /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/.test(version)
}

async function run() {
  await runRelease()

  let tag = null
  if (versionArg === 'alpha') {
    // 读取 package.json 里的主版本
    const packageJsonPath = path.join(rootDir, 'package.json')
    const data = await readFile(packageJsonPath, 'utf8')
    const pkg = JSON.parse(data)
    tag = `v${pkg.version}`
  } else if (versionArg === 'beta') {
    // 读取 package.json 里的主版本
    const packageJsonPath = path.join(rootDir, 'package.json')
    const data = await readFile(packageJsonPath, 'utf8')
    const pkg = JSON.parse(data)
    tag = `v${pkg.version}`
  } else if (versionArg === 'rc') {
    // 读取 package.json 里的主版本
    const packageJsonPath = path.join(rootDir, 'package.json')
    const data = await readFile(packageJsonPath, 'utf8')
    const pkg = JSON.parse(data)
    tag = `v${pkg.version}`
  } else if (isSemver(versionArg)) {
    // 1.2.3 或 v1.2.3
    tag = versionArg.startsWith('v') ? versionArg : `v${versionArg}`
  }

  if (tag) {
    // 打 tag 并推送
    try {
      execSync(`git tag ${tag}`, { stdio: 'inherit' })
      execSync(`git push origin ${tag}`, { stdio: 'inherit' })
      console.log(`[INFO]: Git tag ${tag} created and pushed.`)
    } catch {
      console.error(`[ERROR]: Failed to create or push git tag: ${tag}`)
      process.exit(1)
    }
  } else {
    console.log('[INFO]: No git tag created for this version.')
  }
}

await run()
