# CREB Web: Online Chemical Reaction Equation Balancer (CREB Web)

[Persian version follows | نسخه فارسی در ادامه]

---

## English

CREB Web is a web-based interface for the CREB (Chemical Reaction Equation Balancer) project. It allows users to balance chemical equations directly in their browser, combining the powerful CREB Python backend with a user-friendly HTML frontend. The project is ideal for students, teachers, and anyone needing to quickly balance chemical equations online without installing any software.

### Features

- **Web Interface**: Simple, intuitive HTML frontend for entering chemical equations.
- **Based on CREB**: Leverages the tested algorithm from [CREB](https://github.com/LastChemist/CREB-Chemical_Reaction_Equation_Balancer).
- **Instant Results**: Get balanced equations in real time.
- **Fully Open Source**: Designed to be easily extensible and adaptable.
- **Cross-platform**: Works in any modern browser.
- **Multiple Equation Types**: Supports inorganic, organic, and (potentially) redox reactions.

### Getting Started

Clone the repository:

```bash
git clone https://github.com/LastChemist/web_check.git
cd web_check
```

#### Running Locally

You need Python 3.7+ and required packages (see `requirements.txt`, if present).

1. Start the backend server (e.g., using Flask or your chosen framework):
    ```bash
    python app.py
    ```
2. Open `index.html` in your browser (**or** access `http://localhost:5000` if served automatically).

### Example Usage

- Type: `H2 + O2 -> H2O`  
  Output: `2 H2 + O2 → 2 H2O`
- Type: `C3H8 + O2 -> CO2 + H2O`  
  Output: `C3H8 + 5 O2 → 3 CO2 + 4 H2O`

### Project Structure

- `index.html`: The main web interface.
- `app.py`: Backend server connecting frontend to balancing engine.
- `static/` and `templates/`: If present, standard web folders for Flask/Django.
- Imported core logic from [CREB](https://github.com/LastChemist/CREB-Chemical_Reaction_Equation_Balancer).

### Contributing

We welcome contributions! Suggestions, bug reports, and pull requests are encouraged.

### License

MIT License. See [LICENSE](LICENSE) for more information.

### Contact

Maintainer: [LastChemist](https://github.com/LastChemist)

---

## فارسی (Persian)

CREB Web یک واسط وب برای پروژه‌ی CREB (متوازن‌کننده معادلات شیمیایی) است که به شما اجازه می‌دهد معادلات شیمیایی را مستقیماً در مرورگر خود متوازن کنید. این پروژه برای دانش‌آموزان، معلمان و هر کسی که نیاز به متوازن کردن معادلات شیمیایی دارد، ‌بدون نیاز به نصب هیچ نرم‌افزاری، ایده‌آل است.

### ویژگی‌ها

- **واسط کاربری تحت وب**: رابط کاربری ساده و شهودی با استفاده از HTML برای وارد کردن معادلات شیمیایی.
- **بر پایه CREB**: استفاده از الگوریتم اثبات‌شده پروژه‌ی [CREB](https://github.com/LastChemist/CREB-Chemical_Reaction_Equation_Balancer).
- **نتایج آنی**: متوازن شدن سریع معادلات به صورت بلادرنگ.
- **کاملاً متن باز**: قابلیت توسعه و انطباق آسان.
- **سازگار با همه سیستم‌عامل‌ها**: اجرا در همه مرورگرهای مدرن.
- **پشتیبانی از انواع معادلات**: پشتیبانی از واکنش‌های معدنی، آلی و (در صورت توسعه) واکنش‌های اکسایش-کاهش.

### شروع استفاده

ابتدا مخزن را کلون کنید:

```bash
git clone https://github.com/LastChemist/web_check.git
cd web_check
```

#### اجرا به صورت محلی

نیاز به پایتون 3.7 یا بالاتر و بسته‌های مورد نیاز (لیست در `requirements.txt`).

1. سرور پشتیبان را اجرا کنید (مثلاً با Flask):
    ```bash
    python app.py
    ```
2. فایل `index.html` را در مرورگر باز کنید (**یا** اگر سرور اجرا می‌شود به آدرس `http://localhost:5000` بروید).

### نمونه استفاده

- ورودی: `H2 + O2 -> H2O`  
  خروجی: `2 H2 + O2 → 2 H2O`
- ورودی: `C3H8 + O2 -> CO2 + H2O`  
  خروجی: `C3H8 + 5 O2 → 3 CO2 + 4 H2O`

### ساختار پروژه

- `index.html`: رابط کاربری اصلی وب
- `app.py`: سرور پشتیبان که بخش فرانت‌اند را به موتور متوازن‌کننده وصل می‌کند.
- `static/` و `templates/`: اگر موجود باشد، پوشه‌های استاندارد برای فریم‌ورک‌هایی مثل فلَسک.
- منطق اصلی از پروژه‌ی [CREB](https://github.com/LastChemist/CREB-Chemical_Reaction_Equation_Balancer) وارد شده است.

### مشارکت

از هرگونه پیشنهاد، گزارش اشکال و Pull Request استقبال می‌شود.

### مجوز

بر پایه مجوز MIT. اطلاعات بیشتر در [LICENSE](LICENSE).

### ارتباط

نگهدارنده: [LastChemist](https://github.com/LastChemist)

---

*CREB Web hopes to make chemical equation balancing quick and accessible for everyone!*  
*وب‌چک امیدوار است متوازن کردن معادلات شیمیایی را سریع و در دسترس همه قرار دهد!*
