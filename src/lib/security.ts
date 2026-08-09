import type { NextRequest } from 'next/server';

const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /acunetix/i,
  /nessus/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
];

const BLOCKED_PATHS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/phpmyadmin/i,
  /^\/admin\.php/i,
  /^\/xmlrpc\.php/i,
  /^\/\.well-known\/security\.txt$/i,
];

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function isBlockedBot(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  if (!ua.trim()) return true;
  return BLOCKED_USER_AGENTS.some((pattern) => pattern.test(ua));
}

export function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

export function sanitizeSearchQuery(query: string, maxLength = 200): string {
  return query.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
