/**
 * Слой доступа к API.
 *
 * Здесь только контракт: пути, тела запросов и то, что фронтенд ожидает
 * получить в ответ. Реализацию бэкенда вы пишете сами — при необходимости
 * меняйте пути и формы ответов здесь, компоненты трогать не нужно.
 *
 * Базовый адрес берётся из переменной окружения VITE_API_BASE_URL,
 * по умолчанию — "/api" (в dev-режиме Vite проксирует его на бэкенд,
 * см. vite.config.js).
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

/** Универсальная обёртка над fetch. Бросает Error с текстом ответа при ошибке. */
async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail || `Запрос ${method} ${path} завершился с кодом ${response.status}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Демо-профиль. Используется, пока бэкенд не отвечает, чтобы интерфейс
 * можно было спокойно верстать и смотреть локально. Удалите вместе с
 * обработкой `isDemo` в SettingsDialog, когда API будет готов.
 */
export const DEMO_PROFILE = {
  id: "usr_7f3c21a8",
  name: "Артём",
  email: "artyom@north.app",
  avatarUrl: null,
  subscribed: true,
  plan: "Pro",
};

/* ─────────────────────────── Профиль ─────────────────────────── */

/** GET /api/profile → объект профиля */
export function getProfile(options) {
  return request("/profile", options);
}

/** PATCH /api/profile → обновлённый объект профиля */
export function saveProfile(payload) {
  return request("/profile", { method: "PATCH", body: payload });
}

/* ─────────────────────────── Аккаунт ─────────────────────────── */

/** POST /api/profile/password → 204 */
export function changePassword({ currentPassword, newPassword }) {
  return request("/profile/password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

/** POST /api/auth/logout → 204 */
export function logout() {
  return request("/auth/logout", { method: "POST" });
}
