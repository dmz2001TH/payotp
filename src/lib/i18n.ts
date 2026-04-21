// Multi-language translations
export type Lang = 'th' | 'en' | 'zh';

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  'nav.home': { th: 'หน้าแรก', en: 'Home', zh: '首页' },
  'nav.products': { th: 'สินค้า', en: 'Products', zh: '商品' },
  'nav.dashboard': { th: 'แดชบอร์ด', en: 'Dashboard', zh: '控制台' },
  'nav.admin': { th: 'แอดมิน', en: 'Admin', zh: '管理' },
  'nav.login': { th: 'เข้าสู่ระบบ', en: 'Login', zh: '登录' },
  'nav.register': { th: 'สมัครสมาชิก', en: 'Register', zh: '注册' },
  'nav.logout': { th: 'ออกจากระบบ', en: 'Logout', zh: '退出' },
  'nav.wallet': { th: 'กระเป๋าเงิน', en: 'Wallet', zh: '钱包' },

  // Hero
  'hero.title': { th: 'OTP, แอคเคาท์พรีเมียม, เติมเกม', en: 'OTP, Premium Accounts, Game Top-up', zh: 'OTP、高级账号、游戏充值' },
  'hero.subtitle': { th: 'ถูกที่สุด ส่งทันที 24 ชม.', en: 'Cheapest & Instant Delivery 24/7', zh: '最便宜 即时送达 全天候' },
  'hero.cta': { th: 'เริ่มซื้อเลย', en: 'Start Shopping', zh: '开始购买' },

  // Products
  'product.buy': { th: 'ซื้อเลย', en: 'Buy Now', zh: '立即购买' },
  'product.stock': { th: 'คงเหลือ', en: 'Stock', zh: '库存' },
  'product.outOfStock': { th: 'หมด', en: 'Out of Stock', zh: '已售罄' },
  'product.price': { th: 'ราคา', en: 'Price', zh: '价格' },
  'product.discount': { th: 'ลด', en: 'Off', zh: '优惠' },

  // Auth
  'auth.username': { th: 'ชื่อผู้ใช้', en: 'Username', zh: '用户名' },
  'auth.email': { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  'auth.password': { th: 'รหัสผ่าน', en: 'Password', zh: '密码' },
  'auth.confirmPassword': { th: 'ยืนยันรหัสผ่าน', en: 'Confirm Password', zh: '确认密码' },
  'auth.referralCode': { th: 'รหัสแนะนำ (ไม่บังคับ)', en: 'Referral Code (optional)', zh: '推荐码（可选）' },
  'auth.loginBtn': { th: 'เข้าสู่ระบบ', en: 'Login', zh: '登录' },
  'auth.registerBtn': { th: 'สมัครสมาชิก', en: 'Register', zh: '注册' },
  'auth.noAccount': { th: 'ยังไม่มีบัญชี?', en: "Don't have an account?", zh: '还没有账号？' },
  'auth.hasAccount': { th: 'มีบัญชีแล้ว?', en: 'Already have an account?', zh: '已有账号？' },

  // Wallet
  'wallet.balance': { th: 'ยอดคงเหลือ', en: 'Balance', zh: '余额' },
  'wallet.deposit': { th: 'เติมเงิน', en: 'Deposit', zh: '充值' },
  'wallet.depositAmount': { th: 'จำนวนเงิน', en: 'Amount', zh: '金额' },
  'wallet.promptpay': { th: 'พร้อมเพย์', en: 'PromptPay', zh: 'PromptPay' },
  'wallet.truewallet': { th: 'ทรูมันนี่วอลเล็ท', en: 'TrueMoney Wallet', zh: 'TrueMoney钱包' },
  'wallet.confirmDeposit': { th: 'ยืนยันการเติมเงิน', en: 'Confirm Deposit', zh: '确认充值' },
  'wallet.waiting': { th: 'รอการชำระเงิน', en: 'Awaiting Payment', zh: '等待付款' },
  'wallet.minDeposit': { th: 'เติมขั้นต่ำ', en: 'Minimum Deposit', zh: '最低充值' },

  // Orders
  'order.history': { th: 'ประวัติการสั่งซื้อ', en: 'Order History', zh: '订单历史' },
  'order.id': { th: 'รหัสคำสั่งซื้อ', en: 'Order ID', zh: '订单号' },
  'order.status': { th: 'สถานะ', en: 'Status', zh: '状态' },
  'order.completed': { th: 'สำเร็จ', en: 'Completed', zh: '已完成' },
  'order.pending': { th: 'รอดำเนินการ', en: 'Pending', zh: '处理中' },
  'order.viewData': { th: 'ดูข้อมูล', en: 'View Data', zh: '查看数据' },
  'order.date': { th: 'วันที่', en: 'Date', zh: '日期' },

  // Affiliate
  'affiliate.title': { th: 'ระบบแนะนำเพื่อน', en: 'Referral Program', zh: '推荐系统' },
  'affiliate.code': { th: 'รหัสแนะนำของคุณ', en: 'Your Referral Code', zh: '您的推荐码' },
  'affiliate.earn': { th: 'รายได้', en: 'Earnings', zh: '收入' },
  'affiliate.referrals': { th: 'ผู้ที่แนะนำ', en: 'Referrals', zh: '推荐人数' },
  'affiliate.note': { th: 'ต้องซื้อของอย่างน้อย 1 ครั้งเพื่อเปิดใช้งาน', en: 'Must purchase at least once to activate', zh: '需至少购买一次才能激活' },

  // Admin
  'admin.products': { th: 'จัดการสินค้า', en: 'Manage Products', zh: '商品管理' },
  'admin.orders': { th: 'คำสั่งซื้อ', en: 'Orders', zh: '订单' },
  'admin.deposits': { th: 'การเติมเงิน', en: 'Deposits', zh: '充值记录' },
  'admin.inventory': { th: 'สต็อกสินค้า', en: 'Inventory', zh: '库存' },
  'admin.stats': { th: 'สถิติ', en: 'Statistics', zh: '统计' },
  'admin.confirm': { th: 'ยืนยัน', en: 'Confirm', zh: '确认' },
  'admin.reject': { th: 'ปฏิเสธ', en: 'Reject', zh: '拒绝' },
  'admin.add': { th: 'เพิ่ม', en: 'Add', zh: '添加' },
  'admin.delete': { th: 'ลบ', en: 'Delete', zh: '删除' },
  'admin.edit': { th: 'แก้ไข', en: 'Edit', zh: '编辑' },

  // Footer
  'footer.open24': { th: 'เปิดให้บริการ 24 ชั่วโมง', en: 'Open 24 Hours', zh: '24小时服务' },
  'footer.autoDelivery': { th: 'ส่งสินค้าอัตโนมัติ', en: 'Auto Delivery', zh: '自动发货' },
  'footer.cheapest': { th: 'ราคาถูกที่สุด', en: 'Lowest Price', zh: '最低价' },
  'footer.secure': { th: 'ปลอดภัย 100%', en: '100% Secure', zh: '100%安全' },

  // Common
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...', zh: '加载中...' },
  'common.error': { th: 'เกิดข้อผิดพลาด', en: 'An error occurred', zh: '发生错误' },
  'common.success': { th: 'สำเร็จ!', en: 'Success!', zh: '成功！' },
  'common.save': { th: 'บันทึก', en: 'Save', zh: '保存' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel', zh: '取消' },
  'common.search': { th: 'ค้นหา', en: 'Search', zh: '搜索' },
  'common.back': { th: 'กลับ', en: 'Back', zh: '返回' },
  'common.all': { th: 'ทั้งหมด', en: 'All', zh: '全部' },
  'common.copied': { th: 'คัดลอกแล้ว', en: 'Copied!', zh: '已复制' },
  'common.noData': { th: 'ยังไม่มีรายการ', en: 'No data yet', zh: '暂无记录' },

  // Toast messages
  'toast.depositSuccess': { th: 'สร้างคำขอเติมเงินสำเร็จ', en: 'Deposit request created', zh: '充值请求已创建' },
  'toast.depositConfirm': { th: 'ยืนยันการเติมเงินสำเร็จ', en: 'Deposit confirmed', zh: '充值已确认' },
  'toast.buySuccess': { th: 'ซื้อสำเร็จ!', en: 'Purchase complete!', zh: '购买成功！' },
  'toast.error': { th: 'เกิดข้อผิดพลาด', en: 'An error occurred', zh: '发生错误' },
  'toast.loginRequired': { th: 'กรุณาเข้าสู่ระบบ', en: 'Please login first', zh: '请先登录' },
  'toast.saveSuccess': { th: 'บันทึกสำเร็จ', en: 'Saved successfully', zh: '保存成功' },
  'toast.deleteSuccess': { th: 'ลบสำเร็จ', en: 'Deleted successfully', zh: '删除成功' },
  'toast.confirmSuccess': { th: 'ยืนยันสำเร็จ', en: 'Confirmed successfully', zh: '确认成功' },

  // Dashboard
  'dashboard.depositHistory': { th: 'ประวัติการเติมเงิน', en: 'Deposit History', zh: '充值历史' },
  'dashboard.quickDeposit': { th: 'เติมเงินด่วน', en: 'Quick Deposit', zh: '快速充值' },
  'dashboard.stats': { th: 'สถิติ', en: 'Statistics', zh: '统计' },
  'dashboard.totalDeposits': { th: 'เติมเงินทั้งหมด', en: 'Total Deposits', zh: '总充值' },
  'dashboard.totalOrders': { th: 'สั่งซื้อทั้งหมด', en: 'Total Orders', zh: '总订单' },
  'dashboard.totalSpent': { th: 'ใช้จ่ายทั้งหมด', en: 'Total Spent', zh: '总消费' },
  'dashboard.quickActions': { th: 'ทางลัด', en: 'Quick Actions', zh: '快捷操作' },
  'dashboard.depositNow': { th: 'เติมเงินเลย', en: 'Deposit Now', zh: '立即充值' },
  'dashboard.browseProducts': { th: 'ดูสินค้า', en: 'Browse Products', zh: '浏览商品' },

  // Product search
  'product.search': { th: 'ค้นหาสินค้า...', en: 'Search products...', zh: '搜索商品...' },
  'product.searchResults': { th: 'ผลการค้นหา', en: 'Search Results', zh: '搜索结果' },
  'product.noResults': { th: 'ไม่พบสินค้าที่ค้นหา', en: 'No products found', zh: '未找到商品' },
  'product.tryOther': { th: 'ลองค้นหาคำอื่น', en: 'Try different keywords', zh: '尝试其他关键词' },

  // Pagination
  'pagination.prev': { th: 'ก่อนหน้า', en: 'Previous', zh: '上一页' },
  'pagination.next': { th: 'ถัดไป', en: 'Next', zh: '下一页' },
  'pagination.page': { th: 'หน้า', en: 'Page', zh: '第' },
  'pagination.of': { th: 'จาก', en: 'of', zh: '/' },

  // Order
  'order.total': { th: 'รวม', en: 'Total', zh: '总计' },
  'order.quantity': { th: 'จำนวน', en: 'Quantity', zh: '数量' },
};

export function t(key: string, lang: Lang = 'th'): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['th'] || key;
}

export function getLangName(lang: Lang): string {
  const names: Record<Lang, string> = { th: 'ไทย', en: 'English', zh: '中文' };
  return names[lang];
}
