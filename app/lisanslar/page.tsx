'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { licenseAdminApi } from '@/lib/licenseAdminApi';
import { License } from '@/lib/types';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  LogOut,
  Copy,
  RotateCcw,
  Ban,
  CalendarPlus,
  Search,
  KeyRound,
  Loader2,
  X,
} from 'lucide-react';

function formatDate(ts: number | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_STYLES: Record<License['status'], string> = {
  unused: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

const STATUS_LABELS: Record<License['status'], string> = {
  unused: 'Kullanılmadı',
  active: 'Aktif',
  revoked: 'İptal Edildi',
  expired: 'Süresi Doldu',
};

export default function LisanslarPage() {
  const { user, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [extendTarget, setExtendTarget] = useState<License | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/giris');
  }, [user, authLoading, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await licenseAdminApi.list();
      setLicenses(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err: any) {
      toast.error('Lisanslar yüklenemedi: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Anahtar kopyalandı');
  };

  const handleRevoke = async (license: License) => {
    if (!confirm(`${license.key} anahtarını iptal etmek istediğinize emin misiniz? Uygulama bir sonraki kontrolde kilitlenecek.`)) return;
    setBusyKey(license.key);
    try {
      await licenseAdminApi.revoke(license.key);
      toast.success('Lisans iptal edildi');
      await load();
    } catch (err: any) {
      toast.error('Hata: ' + (err?.message || ''));
    } finally {
      setBusyKey(null);
    }
  };

  const handleResetDevice = async (license: License) => {
    if (!confirm(`${license.key} anahtarının cihaz kaydını sıfırlamak istediğinize emin misiniz? Müşteri anahtarı yeni bir bilgisayarda tekrar etkinleştirebilecek.`)) return;
    setBusyKey(license.key);
    try {
      await licenseAdminApi.resetDevice(license.key);
      toast.success('Cihaz kaydı sıfırlandı');
      await load();
    } catch (err: any) {
      toast.error('Hata: ' + (err?.message || ''));
    } finally {
      setBusyKey(null);
    }
  };

  const filtered = licenses.filter(
    (l) =>
      l.key.toLowerCase().includes(search.toLowerCase()) ||
      l.note.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SatisPro Yönetim</p>
            <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıkış
        </button>
      </header>

      <main className="p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold">Lisanslar</h1>
            <p className="text-sm text-muted-foreground">
              {licenses.length} lisans · {licenses.filter((l) => l.status === 'active').length} aktif
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Anahtar veya not ara..."
                className="pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-52"
              />
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Yeni Lisans
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {licenses.length === 0 ? 'Henüz lisans oluşturulmadı.' : 'Sonuç bulunamadı.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Anahtar</th>
                    <th className="px-4 py-3 font-semibold">Durum</th>
                    <th className="px-4 py-3 font-semibold">Not</th>
                    <th className="px-4 py-3 font-semibold">Oluşturulma</th>
                    <th className="px-4 py-3 font-semibold">Bitiş</th>
                    <th className="px-4 py-3 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((license) => (
                    <tr key={license.key} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold tracking-wider">{license.key}</span>
                          <button
                            onClick={() => handleCopy(license.key)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Kopyala"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[license.status]}`}>
                          {STATUS_LABELS[license.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{license.note || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(license.createdAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(license.expiresAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExtendTarget(license)}
                            disabled={license.status === 'revoked' || busyKey === license.key}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Süre uzat"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetDevice(license)}
                            disabled={!license.hardwareId || busyKey === license.key}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Cihazı sıfırla"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRevoke(license)}
                            disabled={license.status === 'revoked' || busyKey === license.key}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-muted-foreground hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="İptal et"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateLicenseModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {extendTarget && (
        <ExtendLicenseModal
          license={extendTarget}
          onClose={() => setExtendTarget(null)}
          onExtended={load}
        />
      )}
    </div>
  );
}

function CreateLicenseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [durationDays, setDurationDays] = useState<string>('365');
  const [lifetime, setLifetime] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const key = await licenseAdminApi.create(lifetime ? null : Number(durationDays) || null, note.trim());
      setCreatedKey(key);
      onCreated();
    } catch (err: any) {
      toast.error('Lisans oluşturulamadı: ' + (err?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {createdKey ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold">Lisans Oluşturuldu</h2>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center mb-4">
              <p className="font-mono text-lg font-bold tracking-wider">{createdKey}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Bu anahtarı müşterinize iletin. Anahtar yalnızca bir bilgisayarda etkinleştirilebilir.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Kopyalandı'); }}
                className="flex-1 flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4" />
                Kopyala
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Kapat
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Yeni Lisans Oluştur</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <input
                    type="checkbox"
                    checked={lifetime}
                    onChange={(e) => setLifetime(e.target.checked)}
                    className="rounded"
                  />
                  Süresiz lisans
                </label>
                {!lifetime && (
                  <input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="Gün sayısı (örn. 365)"
                    className={inputCls}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Not (isteğe bağlı)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Örn. müşteri adı"
                  className={inputCls}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Oluştur
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExtendLicenseModal({
  license,
  onClose,
  onExtended,
}: {
  license: License;
  onClose: () => void;
  onExtended: () => void;
}) {
  const [days, setDays] = useState('30');
  const [saving, setSaving] = useState(false);

  const handleExtend = async () => {
    const n = Number(days);
    if (!n || n <= 0) { toast.error('Geçerli bir gün sayısı girin'); return; }
    setSaving(true);
    try {
      await licenseAdminApi.extend(license.key, n);
      toast.success(`${n} gün eklendi`);
      onExtended();
      onClose();
    } catch (err: any) {
      toast.error('Hata: ' + (err?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Süre Uzat</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4 font-mono">{license.key}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Eklenecek Gün Sayısı</label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter') handleExtend(); }}
            />
          </div>
          <button
            onClick={handleExtend}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
            Uzat
          </button>
        </div>
      </div>
    </div>
  );
}
