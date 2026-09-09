import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'de' | 'ar';

const translations: Record<AppLanguage, Record<string, string>> = {
  de: {
    brand: 'UMZUG · BOOKING DESK',
    loginTitle: 'Einsteigen,|losfahren.',
    loginIntro: 'Melde dich an, um eine Buchung zu erstellen oder passende Umzugsanfragen zu übernehmen.',
    session: 'Anmelden',
    name: 'Dein Name',
    phone: 'Telefonnummer',
    role: 'Ich bin',
    customer: 'Kunde',
    driver: 'Fahrer',
    continue: 'Weiter',
    loading: 'Wird geladen ...',
    customerArea: 'KUNDENBEREICH',
    customerTitle: 'Dein Umzug,|in Bewegung.',
    customerIntro: 'Lege eine neue Fahrt an und behalte den Status deiner Buchungen im Blick.',
    logout: 'Abmelden',
    newBooking: 'Neue Buchung',
    from: 'Startadresse',
    to: 'Zieladresse',
    createBooking: 'Buchung erstellen',
    myBookings: 'Meine Buchungen',
    noBookings: 'Noch keine Buchungen vorhanden.',
    driverContact: 'Fahrer',
    driverArea: 'FAHRERBEREICH',
    driverTitle: 'Die nächste Fahrt|wartet schon.',
    driverIntro: 'Prüfe offene Umzüge und übernimm die Anfrage, die zu dir passt.',
    openRequests: 'Offene Anfragen',
    noRequests: 'Gerade sind keine offenen Anfragen da.',
    accept: 'Annehmen',
    acceptedRides: 'Meine angenommenen Fahrten',
    customerContact: 'Kunde',
    call: 'Anrufen',
    missingLogin: 'Bitte Name und Telefonnummer vollständig angeben.',
    invalidPhone: 'Bitte eine gültige deutsche Telefonnummer eingeben, z. B. 01512345678, +491512345678 oder 004915750759121.',
    loginError: 'Login konnte nicht durchgeführt werden. Läuft das Backend auf Port 8080?',
    missingAddresses: 'Bitte Start- und Zieladresse auswählen.',
    bookingCreated: 'Buchung wurde erstellt.',
    newRequestNotice: 'Neue Anfrage eingegangen.',
    driverFoundNotice: 'Dein Fahrer wurde gefunden.',
    bookingError: 'Buchung konnte nicht erstellt werden.',
    customerNotFound: 'Kunde wurde nicht gefunden.',
    bookingAccepted: 'Anfrage wurde angenommen.',
    bookingAcceptError: 'Buchung konnte nicht angenommen werden.',
    invalidDriver: 'Dieser User ist kein Fahrer.',
    notFound: 'Buchung oder Fahrer wurde nicht gefunden.',
    alreadyAccepted: 'Diese Buchung wurde bereits angenommen.'
  },
  ar: {
    brand: 'نقل · منصة الحجز',
    loginTitle: 'ابدأ الآن،|وانطلق.',
    loginIntro: 'سجّل الدخول لإنشاء طلب نقل أو قبول طلبات نقل مناسبة.',
    session: 'تسجيل الدخول',
    name: 'اسمك',
    phone: 'رقم الهاتف',
    role: 'أنا',
    customer: 'عميل',
    driver: 'سائق',
    continue: 'متابعة',
    loading: 'جار التحميل ...',
    customerArea: 'منطقة العميل',
    customerTitle: 'نقل منزلك،|أصبح أسهل.',
    customerIntro: 'أنشئ طلب نقل وتابع حالة حجوزاتك.',
    logout: 'تسجيل الخروج',
    newBooking: 'حجز جديد',
    from: 'عنوان الانطلاق',
    to: 'عنوان الوصول',
    createBooking: 'إنشاء الحجز',
    myBookings: 'حجوزاتي',
    noBookings: 'لا توجد حجوزات حتى الآن.',
    driverContact: 'السائق',
    driverArea: 'منطقة السائق',
    driverTitle: 'الرحلة القادمة|بانتظارك.',
    driverIntro: 'راجع طلبات النقل المفتوحة واختر الطلب المناسب لك.',
    openRequests: 'الطلبات المفتوحة',
    noRequests: 'لا توجد طلبات مفتوحة حالياً.',
    accept: 'قبول',
    acceptedRides: 'رحلاتي المقبولة',
    customerContact: 'العميل',
    call: 'اتصال',
    missingLogin: 'يرجى إدخال الاسم ورقم الهاتف بالكامل.',
    invalidPhone: 'يرجى إدخال رقم هاتف ألماني صحيح، مثل 01512345678 أو +491512345678 أو 004915750759121.',
    loginError: 'تعذر تسجيل الدخول. هل يعمل الخادم على المنفذ 8080؟',
    missingAddresses: 'يرجى اختيار عنوان الانطلاق والوصول.',
    bookingCreated: 'تم إنشاء الحجز.',
    newRequestNotice: 'وصل طلب نقل جديد.',
    driverFoundNotice: 'تم العثور على سائقك.',
    bookingError: 'تعذر إنشاء الحجز.',
    customerNotFound: 'لم يتم العثور على العميل.',
    bookingAccepted: 'تم قبول الطلب.',
    bookingAcceptError: 'تعذر قبول الحجز.',
    invalidDriver: 'هذا المستخدم ليس سائقاً.',
    notFound: 'لم يتم العثور على الحجز أو السائق.',
    alreadyAccepted: 'تم قبول هذا الحجز مسبقاً.'
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'umzug-language';
  readonly language = signal<AppLanguage>((localStorage.getItem(this.storageKey) as AppLanguage) || 'de');

  t(key: string): string {
    return translations[this.language()][key] ?? key;
  }

  speak(text: string): void {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const announcement = new SpeechSynthesisUtterance(text);
    announcement.lang = this.language() === 'ar' ? 'ar-SA' : 'de-DE';
    announcement.rate = 0.95;
    window.speechSynthesis.speak(announcement);
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  toggle(): void {
    const nextLanguage = this.language() === 'de' ? 'ar' : 'de';
    this.language.set(nextLanguage);
    localStorage.setItem(this.storageKey, nextLanguage);
  }

  direction(): 'ltr' | 'rtl' {
    return this.language() === 'ar' ? 'rtl' : 'ltr';
  }
}