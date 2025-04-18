#!/usr/bin/env node

/**
 * CLI tool to update version numbers in package.json, apps/client/src-tauri/Cargo.toml, and apps/client/src-tauri/tauri.conf.json.
 *
 * Usage:
 *   pnpm release-version <version>
 *
 * <version> can be:
 *   - A full semver version (e.g., 1.2.3, v1.2.3, 1.2.3-beta, v1.2.3+build)
 *   - A tag: "alpha", "beta", "rc", "autobuild", "autobuild-latest", or "deploytest"
 *     - "alpha", "beta", "rc": Appends the tag to the current base version (e.g., 1.2.3-beta)
 *     - "autobuild": Appends a timestamped autobuild tag (e.g., 1.2.3+autobuild.2406101530)
 *     - "autobuild-latest": Appends an autobuild tag with latest commit (e.g., 1.2.3+autobuild.0614.a1b2c3d)
 *     - "deploytest": Appends a timestamped deploytest tag (e.g., 1.2.3+deploytest.2406101530)
 *
 * Examples:
 *   pnpm release-version 1.2.3
 *   pnpm release-version v1.2.3-beta
 *   pnpm release-version beta
 *   pnpm release-version autobuild
 *   pnpm release-version autobuild-latest
 *   pnpm release-version deploytest
 *
 * The script will:
 *   - Validate and normalize the version argument
 *   - Update the version field in package.json (root)
 *   - Update the version field in apps/client/package.json
 *   - Update the version field in apps/client/src-tauri/Cargo.toml
 *   - Update the version field in apps/client/src-tauri/tauri.conf.json
 *   - Update the version field in packages/ui/package.json
 *   - Update the version field in packages/uno-preset/package.json
 *
 * Errors are logged and the process exits with code 1 on failure.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

/**
 * 获取当前 git 短 commit hash
 * @returns {string} 短 commit hash 或 'nogit'
 */
function getGitShortCommit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  }
  catch {
    console.warn('[WARN]: Failed to get git short commit, fallback to \'nogit\'')
    return 'nogit'
  }
}

/**
 * 生成短时间戳（格式：YYMMDD）或带 commit（格式：YYMMDD.cc39b27）
 * @param {boolean} withCommit 是否带 commit
 * @returns {string} 格式化的时间戳字符串
 */
function generateShortTimestamp(withCommit = false) {
  const now = new Date()
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  if (withCommit) {
    const gitShort = getGitShortCommit()
    return `${year}${month}${day}${hours}${minutes}.${gitShort}`
  }
  return `${year}${month}${day}${hours}${minutes}`
}

/**
 * 验证版本号格式
 * @param {string} version
 * @returns {boolean} 是否为有效的版本号格式
 */
function isValidVersion(version) {
  return /^v?\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)(?:\.\d+)?)?(?:\+[a-z0-9-]+(?:\.[a-z0-9-]+)*)?$/i.test(version)
}

/**
 * 标准化版本号
 * @param {string} version
 * @returns {string} 标准化的版本号（带 v 前缀）
 */
function normalizeVersion(version) {
  return version.startsWith('v') ? version : `v${version}`
}

/**
 * 提取基础版本号（去掉所有 -tag 和 +build 部分）
 * @param {string} version
 * @returns {string} 基础版本号
 */
function getBaseVersion(version) {
  let base = version.replace(/-(?:alpha|beta|rc)(?:\.\d+)?/i, '')
  base = base.replace(/\+[a-z0-9-]+(?:\.[a-z0-9-]+)*/gi, '')
  return base
}

/**
 * 更新 package.json 版本号
 * @param {string} packagePath
 * @param {string} newVersion
 */
async function updatePackageVersion(packagePath, newVersion) {
  try {
    if (!(await fs.access(packagePath).then(() => true).catch(() => false))) {
      console.warn(`[WARN]: ${packagePath} not found, skipping`)
      return
    }

    const data = await fs.readFile(packagePath, 'utf8')
    const packageJson = JSON.parse(data)

    console.log(`[INFO]: Current ${packagePath} version is:`, packageJson.version)
    packageJson.version = newVersion.startsWith('v') ? newVersion.slice(1) : newVersion

    await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
    console.log(`[INFO]: ${packagePath} version updated to: ${packageJson.version}`)
  }
  catch (error) {
    console.error(`Error updating ${packagePath} version:`, error)
    throw error
  }
}

/**
 * 更新 Cargo.toml 版本号
 * @param {string} newVersion
 */
async function updateCargoVersion(newVersion) {
  const cargoTomlPath = path.join(process.cwd(), 'apps/client/src-tauri/Cargo.toml')
  try {
    if (!(await fs.access(cargoTomlPath).then(() => true).catch(() => false))) {
      console.warn('[WARN]: Cargo.toml not found, skipping')
      return
    }

    const data = await fs.readFile(cargoTomlPath, 'utf8')
    const lines = data.split('\n')
    const versionWithoutV = newVersion.startsWith('v') ? newVersion.slice(1) : newVersion

    const updatedLines = lines.map((line) => {
      if (line.trim().startsWith('version =')) {
        return line.replace(/version\s*=\s*"[^"]+"/, `version = "${versionWithoutV}"`)
      }
      return line
    })

    await fs.writeFile(cargoTomlPath, updatedLines.join('\n'), 'utf8')
    console.log(`[INFO]: Cargo.toml version updated to: ${versionWithoutV}`)
  }
  catch (error) {
    console.error('Error updating Cargo.toml version:', error)
    throw error
  }
}

/**
 * 更新 tauri.conf.json 版本号
 * @param {string} newVersion
 */
async function updateTauriConfigVersion(newVersion) {
  const tauriConfigPath = path.join(process.cwd(), 'apps/client/src-tauri/tauri.conf.json')
  try {
    if (!(await fs.access(tauriConfigPath).then(() => true).catch(() => false))) {
      console.warn('[WARN]: tauri.conf.json not found, skipping')
      return
    }

    const data = await fs.readFile(tauriConfigPath, 'utf8')
    const tauriConfig = JSON.parse(data)
    const versionWithoutV = newVersion.startsWith('v') ? newVersion.slice(1) : newVersion

    console.log('[INFO]: Current tauri.conf.json version is:', tauriConfig.version)

    // 使用完整版本信息，包含build metadata
    tauriConfig.version = versionWithoutV

    await fs.writeFile(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`, 'utf8')
    console.log(`[INFO]: tauri.conf.json version updated to: ${versionWithoutV}`)
  }
  catch (error) {
    console.error('Error updating tauri.conf.json version:', error)
    throw error
  }
}

/**
 * 获取当前版本号
 */
async function getCurrentVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  try {
    const data = await fs.readFile(packageJsonPath, 'utf8')
    const packageJson = JSON.parse(data)
    return packageJson.version
  }
  catch (error) {
    console.error('Error getting current version:', error)
    throw error
  }
}

/**
 * 主函数
 */
async function main(versionArg) {
  if (!versionArg) {
    console.error('Error: Version argument is required')
    process.exit(1)
  }

  try {
    let newVersion
    const validTags = ['alpha', 'beta', 'rc', 'autobuild', 'autobuild-latest', 'deploytest']

    if (validTags.includes(versionArg.toLowerCase())) {
      const currentVersion = await getCurrentVersion()
      const baseVersion = getBaseVersion(currentVersion)

      if (versionArg.toLowerCase() === 'autobuild') {
        // 格式: 2.3.0+autobuild.2501011530.cc39b27
        newVersion = `${baseVersion}+autobuild.${generateShortTimestamp(true)}`
      }
      else if (versionArg.toLowerCase() === 'autobuild-latest') {
        // 格式: 2.3.0+autobuild.250101.a1b2c3d
        const gitShort = getGitShortCommit()
        newVersion = `${baseVersion}+autobuild.${generateShortTimestamp()}.${gitShort}`
      }
      else if (versionArg.toLowerCase() === 'deploytest') {
        // 格式: 2.3.0+deploytest.2501011530.cc39b27
        newVersion = `${baseVersion}+deploytest.${generateShortTimestamp(true)}`
      }
      else {
        newVersion = `${baseVersion}-${versionArg.toLowerCase()}`
      }
    }
    else {
      if (!isValidVersion(versionArg)) {
        console.error('Error: Invalid version format')
        process.exit(1)
      }
      newVersion = normalizeVersion(versionArg)
    }

    console.log(`[INFO]: Updating versions to: ${newVersion}`)

    // 更新所有相关文件的版本
    await updatePackageVersion('package.json', newVersion)
    await updatePackageVersion('apps/client/package.json', newVersion)
    await updatePackageVersion('packages/ui/package.json', newVersion)
    await updatePackageVersion('packages/uno-preset/package.json', newVersion)
    await updateCargoVersion(newVersion)
    await updateTauriConfigVersion(newVersion)

    console.log('[SUCCESS]: All version updates completed successfully!')

    // 执行 git 提交
    try {
      console.log('[INFO]: Adding all changes to git...')
      execSync('git add .', { stdio: 'inherit' })

      console.log('[INFO]: Committing changes...')
      execSync(`git commit -m "release: ${newVersion}"`, { stdio: 'inherit' })

      console.log('[INFO]: Pushing changes to remote...')
      execSync('git push', { stdio: 'inherit' })

      console.log('[SUCCESS]: Git commit completed successfully!')
    }
    catch (error) {
      console.error('[ERROR]: Failed to commit changes to git:', error)
      process.exit(1)
    }
  }
  catch (error) {
    console.error('[ERROR]: Failed to update versions:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
const isMainModule = process.argv[1] && process.argv[1].endsWith('release-version.mjs')
if (isMainModule) {
  const versionArg = process.argv[2]
  main(versionArg)
}

export { main }
