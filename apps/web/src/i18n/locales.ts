import type { I18nKey } from './keys';

export const LOCALES = ['lo', 'th', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type Dictionary = Record<I18nKey, string>;

export const en: Dictionary = {
  'app.workspace': 'Workspace',
  'nav.overview': 'Overview',
  'nav.orders': 'Orders',
  'nav.products': 'Products',
  'nav.categories': 'Categories',
  'nav.knowledge': 'Knowledge',
  'nav.promotions': 'Promotions',
  'nav.paymentAccounts': 'Payment accounts',
  'nav.bankSync': 'Bank Sync',
  'nav.operations': 'Operations',
  'nav.telegram': 'Telegram',
  'nav.messaging': 'Messaging',
  'nav.customers': 'Customers',
  'nav.settings': 'Settings',
  'action.signOut': 'Sign out',
  'merchant.overview.title': 'Overview',
  'merchant.overview.description': 'Store Operations Workspace',
  'merchant.setupReadiness.title': 'Setup readiness',
  'merchant.setupReadiness.subtitle': 'Complete setup to start selling.',
  'merchant.setupReadiness.empty': 'Loading setup status…',
  'action.setUpArrow': 'Set up →',
  'kpi.ordersToday': 'Orders today',
  'kpi.pendingPayment': 'Pending payment',
  'kpi.paidToday': 'Paid today',
  'kpi.manualReview': 'Manual review',
  'kpi.probableMatch': 'Probable match',
  'kpi.readyToShip': 'Ready to ship',
  'kpi.activeProducts': 'Active products',
  'kpi.paymentAccounts': 'Payment accounts',
};

export const th: Dictionary = {
  'app.workspace': 'Workspace',
  'nav.overview': 'ภาพรวม',
  'nav.orders': 'ออเดอร์',
  'nav.products': 'สินค้า',
  'nav.categories': 'หมวดหมู่',
  'nav.knowledge': 'ความรู้',
  'nav.promotions': 'โปรโมชัน',
  'nav.paymentAccounts': 'บัญชีรับเงิน',
  'nav.bankSync': 'ซิงก์ธนาคาร',
  'nav.operations': 'ปฏิบัติการ',
  'nav.telegram': 'Telegram',
  'nav.messaging': 'แชต',
  'nav.customers': 'ลูกค้า',
  'nav.settings': 'ตั้งค่า',
  'action.signOut': 'ออกจากระบบ',
  'merchant.overview.title': 'ภาพรวม',
  'merchant.overview.description': 'ศูนย์ปฏิบัติการร้านค้า',
  'merchant.setupReadiness.title': 'ความพร้อมใช้งาน',
  'merchant.setupReadiness.subtitle': 'ทำขั้นตอนให้ครบเพื่อเริ่มขายได้',
  'merchant.setupReadiness.empty': 'กำลังโหลดสถานะการตั้งค่า…',
  'action.setUpArrow': 'ตั้งค่า →',
  'kpi.ordersToday': 'ออเดอร์วันนี้',
  'kpi.pendingPayment': 'รอชำระเงิน',
  'kpi.paidToday': 'ชำระแล้ววันนี้',
  'kpi.manualReview': 'ต้องตรวจสอบ',
  'kpi.probableMatch': 'น่าจะตรงกัน',
  'kpi.readyToShip': 'พร้อมจัดส่ง',
  'kpi.activeProducts': 'สินค้าพร้อมขาย',
  'kpi.paymentAccounts': 'บัญชีรับเงิน',
};

export const lo: Dictionary = {
  'app.workspace': 'Workspace',
  'nav.overview': 'ພາບລວມ',
  'nav.orders': 'ອໍເດີ',
  'nav.products': 'ສິນຄ້າ',
  'nav.categories': 'ໝວດໝູ່',
  'nav.knowledge': 'ຄວາມຮູ້',
  'nav.promotions': 'ໂປຣໂມຊັນ',
  'nav.paymentAccounts': 'ບັນຊີຮັບເງິນ',
  'nav.bankSync': 'Sync ທະນາຄານ',
  'nav.operations': 'ປະຕິບັດການ',
  'nav.telegram': 'Telegram',
  'nav.messaging': 'ແຊັດ',
  'nav.customers': 'ລູກຄ້າ',
  'nav.settings': 'ຕັ້ງຄ່າ',
  'action.signOut': 'ອອກຈາກລະບົບ',
  'merchant.overview.title': 'ພາບລວມ',
  'merchant.overview.description': 'ສູນປະຕິບັດການຮ້ານຄ້າ',
  'merchant.setupReadiness.title': 'ຄວາມພ້ອມໃຊ້ງານ',
  'merchant.setupReadiness.subtitle': 'ກະລຸນາຕັ້ງຄ່າໃຫ້ຄົບກ່ອນເລີ່ມຂາຍ',
  'merchant.setupReadiness.empty': 'ກຳລັງໂຫຼດສະຖານະການຕັ້ງຄ່າ…',
  'action.setUpArrow': 'ຕັ້ງຄ່າ →',
  'kpi.ordersToday': 'ອໍເດີມື້ນີ້',
  'kpi.pendingPayment': 'ລໍຖ້າຊຳລະ',
  'kpi.paidToday': 'ຈ່າຍແລ້ວມື້ນີ້',
  'kpi.manualReview': 'ຕ້ອງກວດສອບ',
  'kpi.probableMatch': 'ອາດຈະຕົງກັນ',
  'kpi.readyToShip': 'ພ້ອມສົ່ງ',
  'kpi.activeProducts': 'ສິນຄ້າກຳລັງຂາຍ',
  'kpi.paymentAccounts': 'ບັນຊີຮັບເງິນ',
};

export const dictionaries: Record<Locale, Dictionary> = { en, th, lo };

export function deriveLocaleFromMerchant(input: { default_country?: string | null } | null | undefined): Locale {
  const cc = input?.default_country?.toUpperCase().trim();
  if (cc === 'LA') return 'lo';
  if (cc === 'TH') return 'th';
  return 'en';
}

