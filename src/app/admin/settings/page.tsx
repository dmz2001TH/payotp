'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useToast } from '@/components/Toast';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { lang, user, authLoading } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { router.push('/'); return; }
    loadSettings();
  }, [user, authLoading]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        toast.showToast('บันทึกสำเร็จ!', 'success');
        loadSettings();
      } else {
        toast.showToast(data.error, 'error');
      }
    } catch { toast.showToast('เกิดข้อผิดพลาด', 'error'); }
    setSaving(false);
  };

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" /></div>;
  }
  if (!user || user.role !== 'admin') return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5 md:p-6 mb-4">
      <h3 className="font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--primary)' }}>{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
      <label className="input-label">{label}</label>
      <input type={type} className="input-field" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container-app py-6 md:py-8">
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <Link href="/admin" className="hover:text-[var(--primary)]">Admin</Link>
            <span>/</span>
            <span style={{ color: 'var(--primary)' }}>{lang === 'th' ? 'ตั้งค่า' : 'Settings'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">⚙️ {lang === 'th' ? 'ตั้งค่าระบบ' : 'System Settings'}</h1>
        </div>
      </div>

      <div className="container-app py-6">
        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 w-full" />)}</div>
        ) : (
          <>
            <Section title="🏪 ข้อมูลร้านค้า">
              <Field label="ชื่อร้าน" value={settings.site_name} onChange={v => update('site_name', v)} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="สโลแกน (ไทย)" value={settings.site_slogan_th} onChange={v => update('site_slogan_th', v)} />
                <Field label="Slogan (EN)" value={settings.site_slogan_en} onChange={v => update('site_slogan_en', v)} />
                <Field label="标语 (中文)" value={settings.site_slogan_zh} onChange={v => update('site_slogan_zh', v)} />
              </div>
            </Section>

            <Section title="💳 ข้อมูลการชำระเงิน">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="PromptPay เบอร์/เลขบัตร" value={settings.promptpay_number} onChange={v => update('promptpay_number', v)} placeholder="08xxxxxxxx หรือ 1xxxxxxxxxxxx" />
                <Field label="ชื่อบัญชี PromptPay" value={settings.promptpay_name} onChange={v => update('promptpay_name', v)} />
                <Field label="TrueMoney เบอร์" value={settings.truewallet_number} onChange={v => update('truewallet_number', v)} placeholder="08xxxxxxxx" />
                <Field label="ขั้นต่ำเติมเงิน (บาท)" value={settings.min_deposit} onChange={v => update('min_deposit', v)} type="number" />
              </div>
            </Section>

            <Section title="🔗 API Keys">
              <Field label="SMS-Activate API Key" value={settings.sms_activate_api_key} onChange={v => update('sms_activate_api_key', v)} placeholder="ใส่ API Key หรือปล่อยว่าง" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="GBPrimePay Token" value={settings.gbprimepay_token} onChange={v => update('gbprimepay_token', v)} />
                <Field label="GBPrimePay API Key" value={settings.gbprimepay_api_key} onChange={v => update('gbprimepay_api_key', v)} />
              </div>
              <Field label="SMS Webhook Key" value={settings.sms_webhook_key} onChange={v => update('sms_webhook_key', v)} />
            </Section>

            <Section title="👥 ระบบแนะนำ">
              <Field label="ค่าคอมมิชชั่น (%)" value={settings.referral_commission} onChange={v => update('referral_commission', v)} type="number" placeholder="5" />
            </Section>

            <div className="flex justify-end mt-4">
              <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3 text-base">
                {saving ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : `💾 ${lang === 'th' ? 'บันทึกการตั้งค่า' : 'Save Settings'}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
