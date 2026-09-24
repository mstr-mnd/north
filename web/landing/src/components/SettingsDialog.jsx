import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pikoloo/darwin-ui";
import {
  AtSign,
  BadgeCheck,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { DEMO_PROFILE, changePassword, getProfile, logout, saveProfile } from "../api.js";

const emptyPassword = { current: "", next: "", repeat: "" };

/** ar•••@north.app — показываем первую половину локальной части, остальное скрываем. */
function maskEmail(value) {
  const email = String(value ?? "");
  const at = email.indexOf("@");
  if (at < 1) return email || "—";

  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = local.slice(0, Math.max(1, Math.ceil(local.length / 2)));
  const hidden = "•".repeat(Math.max(3, local.length - visible.length));

  return `${visible}${hidden}${domain}`;
}

function initials(profile) {
  const name = String(profile?.name ?? "").trim();
  if (!name) return String(profile?.email ?? "?").slice(0, 1).toUpperCase();

  const parts = name.split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);

  return letters.toUpperCase();
}

export default function SettingsDialog({ open, onOpenChange }) {
  const [tab, setTab] = useState("profile");

  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [draft, setDraft] = useState(DEMO_PROFILE);
  const [passwords, setPasswords] = useState(emptyPassword);
  const [isEmailVisible, setIsEmailVisible] = useState(false);

  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const statusTimer = useRef(null);

  /* Загрузка данных при открытии окна. Пока бэкенд не готов — работаем на демо-данных. */
  useEffect(() => {
    if (!open) return undefined;

    let alive = true;
    const controller = new AbortController();
    setLoading(true);
    setIsEmailVisible(false);

    (async () => {
      try {
        const remoteProfile = await getProfile({ signal: controller.signal });
        if (!alive) return;
        setProfile(remoteProfile);
        setDraft(remoteProfile);
        setIsDemo(false);
      } catch {
        if (!alive) return;
        setProfile(DEMO_PROFILE);
        setDraft(DEMO_PROFILE);
        setIsDemo(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [open]);

  useEffect(() => () => clearTimeout(statusTimer.current), []);

  function flash(message, tone = "ok") {
    setStatus({ message, tone });
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(null), 3200);
  }

  const isDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(draft),
    [profile, draft],
  );

  const displayName = String(profile?.name ?? "").trim() || "Профиль";
  const isSubscribed = Boolean(profile?.subscribed);

  function update(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = isDemo ? draft : await saveProfile(draft);
      setProfile(updated ?? draft);
      setDraft(updated ?? draft);
      flash("Изменения сохранены");
    } catch (error) {
      flash(error.message || "Не удалось сохранить", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    if (passwords.next !== passwords.repeat) {
      flash("Пароли не совпадают", "error");
      return;
    }
    setSaving(true);
    try {
      if (!isDemo) {
        await changePassword({
          currentPassword: passwords.current,
          newPassword: passwords.next,
        });
      }
      setPasswords(emptyPassword);
      flash("Пароль обновлён");
    } catch (error) {
      flash(error.message || "Не удалось изменить пароль", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (!isDemo) await logout().catch(() => undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="settings-dialog" size="xl">
        <DialogClose />

        <div className="settings-head">
          <div className="settings-identity">
            <Avatar
              className="settings-avatar"
              src={draft.avatarUrl || undefined}
              alt={displayName}
              fallback={initials(draft)}
              size="lg"
            />

            <div className="settings-identity-text">
              <DialogTitle className="settings-name">{displayName}</DialogTitle>
              <DialogDescription className="settings-email">
                Настройки аккаунта
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="settings-body">
          <Tabs className="settings-tabs-root" value={tab} onValueChange={setTab}>
            <TabsList className="settings-tabs">
              <TabsTrigger value="profile" icon={<UserRound />}>
                Профиль
              </TabsTrigger>
              <TabsTrigger value="security" icon={<ShieldCheck />}>
                Безопасность
              </TabsTrigger>
            </TabsList>

            <div className="settings-panes">
              {/* ─────────────── Профиль ─────────────── */}
              <TabsContent className="settings-pane" value="profile">
                <label className="field">
                  <span>Имя</span>
                  <Input
                    name="name"
                    value={draft.name ?? ""}
                    placeholder="Как к вам обращаться"
                    size="lg"
                    leftIcon={<UserRound className="field-icon" />}
                    autoComplete="given-name"
                    onChange={(event) => update("name", event.target.value)}
                  />
                </label>

                <section className="settings-card">
                  <h3 className="settings-card-title">Информация профиля</h3>

                  <dl className="info-list">
                    <div className="info-row">
                      <dt>
                        <IdCard className="info-icon" aria-hidden="true" />
                        ID
                      </dt>
                      <dd>{profile.id || "—"}</dd>
                    </div>

                    <div className="info-row">
                      <dt>
                        <BadgeCheck className="info-icon" aria-hidden="true" />
                        Подписка
                      </dt>
                      <dd>
                        <span className={`status-pill ${isSubscribed ? "on" : "off"}`}>
                          <span className="status-dot" aria-hidden="true" />
                          {isSubscribed
                            ? `Активна${profile.plan ? ` · ${profile.plan}` : ""}`
                            : "Не активна"}
                        </span>
                      </dd>
                    </div>

                    <div className="info-row">
                      <dt>
                        <AtSign className="info-icon" aria-hidden="true" />
                        Email
                      </dt>
                      <dd className="info-value">
                        <span className="info-email">
                          {isEmailVisible ? draft.email || "—" : maskEmail(draft.email)}
                        </span>
                        <button
                          className="reveal-button"
                          type="button"
                          aria-pressed={isEmailVisible}
                          aria-label={isEmailVisible ? "Скрыть email" : "Показать email"}
                          title={isEmailVisible ? "Скрыть" : "Показать"}
                          onClick={() => setIsEmailVisible((prev) => !prev)}
                        >
                          {isEmailVisible ? <EyeOff /> : <Eye />}
                        </button>
                      </dd>
                    </div>
                  </dl>
                </section>
              </TabsContent>

              {/* ─────────────── Безопасность ─────────────── */}
              <TabsContent className="settings-pane" value="security">
                <form className="settings-form" onSubmit={handlePasswordChange}>
                  <h3 className="settings-card-title">Смена пароля</h3>

                  <label className="field">
                    <span>Текущий пароль</span>
                    <Input.Password
                      name="current-password"
                      value={passwords.current}
                      placeholder="Введите текущий пароль"
                      size="lg"
                      leftIcon={<KeyRound className="field-icon" />}
                      autoComplete="current-password"
                      onChange={(event) =>
                        setPasswords((prev) => ({ ...prev, current: event.target.value }))
                      }
                    />
                  </label>

                  <div className="field-grid">
                    <label className="field">
                      <span>Новый пароль</span>
                      <Input.Password
                        name="new-password"
                        value={passwords.next}
                        placeholder="Не менее 8 символов"
                        size="lg"
                        minLength={8}
                        autoComplete="new-password"
                        onChange={(event) =>
                          setPasswords((prev) => ({ ...prev, next: event.target.value }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Повторите пароль</span>
                      <Input.Password
                        name="repeat-password"
                        value={passwords.repeat}
                        placeholder="Ещё раз"
                        size="lg"
                        minLength={8}
                        autoComplete="new-password"
                        onChange={(event) =>
                          setPasswords((prev) => ({ ...prev, repeat: event.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <div className="pane-actions">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      loading={saving}
                      disabled={!passwords.current || !passwords.next}
                    >
                      Обновить пароль
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="settings-foot">
          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Выйти из аккаунта
          </button>

          <div className="settings-foot-right">
            {status ? (
              <span className={`settings-status ${status.tone}`} role="status">
                {status.message}
              </span>
            ) : loading ? (
              <span className="settings-status muted">Загрузка профиля…</span>
            ) : null}

            <Button
              variant="ghost"
              size="lg"
              onClick={() => onOpenChange(false)}
              className="settings-cancel"
            >
              Закрыть
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleSave}
              loading={saving}
              disabled={!isDirty}
              className="settings-save"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
