// متغير لتتبع حالة الوضع الليلي
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// تحميل الوضع الليلي من Local Storage (إذا كان مفعلًا)
if (isDarkMode) {
    toggleDarkMode();
}

// تبديل الوضع الليلي عند النقر على الزر
document.getElementById('darkModeToggle').addEventListener('click', () => {
    toggleDarkMode();
});

// دالة لتغيير الوضع الليلي
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);

    // تغيير الأيقونة بين الهلال والشمس
    const darkModeButton = document.getElementById('darkModeToggle');
    if (isDarkMode) {
        darkModeButton.innerHTML = '<i class="fas fa-sun"></i>'; // أيقونة الشمس
    } else {
        darkModeButton.innerHTML = '<i class="fas fa-moon"></i>'; // أيقونة الهلال
    }
}

// تحميل البيانات المحفوظة
function loadInventory() {
    const savedInventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // مسح الجدول الحالي
    savedInventory.forEach(product => {
        addProductToTable(product);
    });
}

// إضافة منتج جديد إلى الجدول
function addProductToTable(product) {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="اسم المنتج" value="${product.name || ''}"></td>
        <td>
            <div class="product-type-container">
                <select onchange="handleProductTypeChange(this)">
                    <option value="كرتون" ${product.type === 'كرتون' ? 'selected' : ''}>كرتون</option>
                    <option value="شوالة" ${product.type === 'شوالة' ? 'selected' : ''}>شوالة</option>
                    <option value="كيس" ${product.type === 'كيس' ? 'selected' : ''}>كيس</option>
                    <option value="كيلو" ${product.type === 'كيلو' ? 'selected' : ''}>كيلو</option>
                    <option value="شدة" ${product.type === 'شدة' ? 'selected' : ''}>شدة</option>
                    <option value="تخصيص">تخصيص</option>
                </select>
                <input type="text" class="custom-type-input" placeholder="اكتب النوع" value="${product.type === 'كرتون' || product.type === 'شوالة' || product.type === 'كيس' || product.type === 'كيلو' || product.type === 'شدة' ? '' : product.type}" style="display: ${product.type === 'كرتون' || product.type === 'شوالة' || product.type === 'كيس' || product.type === 'كيلو' || product.type === 'شدة' ? 'none' : 'inline-block'};">
            </div>
        </td>
        <td>
            <div class="quantity-controls">
                <button onclick="changeQuantity(this, -1, 'cartons')">-</button>
                <input type="number" class="quantity-input" value="${product.cartons || 0}" onchange="updateQuantity(this, 'cartons')">
                <button onclick="changeQuantity(this, 1, 'cartons')">+</button>
            </div>
        </td>
        <td>
            <div class="quantity-controls">
                <button onclick="changeQuantity(this, -1, 'bags')">-</button>
                <input type="number" class="quantity-input" value="${product.bags || 0}" onchange="updateQuantity(this, 'bags')">
                <button onclick="changeQuantity(this, 1, 'bags')">+</button>
            </div>
        </td>
        <td><input type="text" placeholder="رقم الحجم" value="${product.size || ''}"></td>
        <td><input type="text" placeholder="الموقع" value="${product.location || ''}"></td>
        <td><button class="delete-btn" onclick="deleteProduct(this)">حذف</button></td>
    `;
    updateRowColors(newRow);
}

// إضافة منتج جديد
function addProduct() {
    const product = { name: '', type: 'كرتون', cartons: 0, bags: 0, size: '', location: '' };
    addProductToTable(product);
    saveInventory();
    showNotification('تمت إضافة منتج جديد بنجاح!');
}

// تعديل الكمية باستخدام الأزرار + و -
function changeQuantity(button, change, type) {
    const input = button.parentElement.querySelector('.quantity-input');
    let quantity = parseInt(input.value);
    quantity += change;
    if (quantity < 0) quantity = 0;
    input.value = quantity;
    updateQuantity(input, type);
}

// تحديث الكمية عند التحرير بالكيبورد
function updateQuantity(input, type) {
    let quantity = parseInt(input.value);
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    input.value = quantity;
    saveInventory();
    updateRowColors(input.closest('tr'));
}

// نسخ النص النهائي
function copyFinalText() {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    let finalText = '';
    for (let row of table.rows) {
        const cells = row.cells;
        const productName = cells[0].querySelector('input').value;
        const productType = cells[1].querySelector('select').value === 'تخصيص' ? cells[1].querySelector('.custom-type-input').value : cells[1].querySelector('select').value;
        const quantity = parseInt(cells[2].querySelector('.quantity-input').value);
        const bags = parseInt(cells[3].querySelector('.quantity-input').value);
        const size = cells[4].querySelector('input').value;

        let productText = productName;

        // إضافة نوع المنتج إذا كان موجودًا
        if (productType && productType !== 'كرتون' && productType !== 'كيس' && productType !== 'شوالة') {
            productText += ` ${productType}`;
        }

        // إضافة الكمية مع الوحدة المناسبة
        if (quantity > 0) {
            let unit = 'كرتون'; // الوحدة الافتراضية
            if (productType === 'شوالة') {
                unit = 'شوال';
            } else if (productType === 'كيس') {
                unit = 'كيس';
            } else if (productType === 'كيلو') {
                unit = 'كيلو';
            }
            productText += ` ${quantity} ${unit}`;
        }

        // إضافة الأكياس إذا كانت أكبر من صفر
        if (bags > 0) {
            productText += ` و ${bags} كيس`;
        }

        // إضافة رقم الحجم إذا كان موجودًا
        if (size) {
            productText += ` رقم ${size}`;
        }

        finalText += productText + '\n';
    }
    navigator.clipboard.writeText(finalText).then(() => showNotification('تم نسخ النص بنجاح!'));
}

// حذف المنتج
function deleteProduct(button) {
    const row = button.parentElement.parentElement;
    row.remove();
    saveInventory();
    showNotification('تم حذف المنتج بنجاح!');
}

// حفظ المخزون
function saveInventory() {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const inventory = [];
    for (let row of table.rows) {
        const cells = row.cells;
        const product = {
            name: cells[0].querySelector('input').value,
            type: cells[1].querySelector('select').value === 'تخصيص' ? cells[1].querySelector('.custom-type-input').value : cells[1].querySelector('select').value,
            cartons: parseInt(cells[2].querySelector('.quantity-input').value),
            bags: parseInt(cells[3].querySelector('.quantity-input').value),
            size: cells[4].querySelector('input').value,
            location: cells[5].querySelector('input').value,
        };
        inventory.push(product);
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// تحميل البيانات عند فتح الصفحة
loadInventory();

// تغيير نوع المنتج
function handleProductTypeChange(select) {
    const customInput = select.parentElement.querySelector('.custom-type-input');
    if (select.value === 'تخصيص') {
        customInput.style.display = 'inline-block';
    } else {
        customInput.style.display = 'none';
    }
}

// إظهار إشعار
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // حساب عدد الإشعارات المعروضة حاليًا
    const notifications = document.querySelectorAll('.notification');
    const notificationCount = notifications.length;

    // تحديد الموضع الرأسي للإشعار الجديد
    const notificationHeight = notification.offsetHeight;
    const margin = 10; // المسافة بين الإشعارات
    const topPosition = (notificationHeight + margin) * (notificationCount - 1);

    notification.style.top = `${topPosition}px`;

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// فرز المنتجات حسب الاسم أو الكمية أو الأكياس أو المكان
function sortInventory(by) {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const rows = Array.from(table.rows);
    rows.sort((a, b) => {
        if (by === 'name') {
            const aName = a.cells[0].querySelector('input').value.toLowerCase();
            const bName = b.cells[0].querySelector('input').value.toLowerCase();
            return aName.localeCompare(bName);
        } else if (by === 'quantity') {
            const aQuantity = parseInt(a.cells[2].querySelector('.quantity-input').value);
            const bQuantity = parseInt(b.cells[2].querySelector('.quantity-input').value);
            return aQuantity - bQuantity;
        } else if (by === 'bags') {
            const aBags = parseInt(a.cells[3].querySelector('.quantity-input').value);
            const bBags = parseInt(b.cells[3].querySelector('.quantity-input').value);
            return aBags - bBags;
        } else if (by === 'location') {
            const aLocation = a.cells[5].querySelector('input').value.toLowerCase();
            const bLocation = b.cells[5].querySelector('input').value.toLowerCase();
            return aLocation.localeCompare(bLocation);
        }
    });
    table.innerHTML = '';
    rows.forEach(row => table.appendChild(row));
}

// إعادة تعيين الفرز
function resetFilter() {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    for (let row of table.rows) {
        row.style.display = '';
    }
}

// تحديث ألوان الصفوف بناءً على عدد الأصناف
function updateRowColors(row) {
    const cartons = parseInt(row.cells[2].querySelector('.quantity-input').value) || 0;
    const bags = parseInt(row.cells[3].querySelector('.quantity-input').value) || 0;
    const size = row.cells[4].querySelector('input').value.trim();
    const location = row.cells[5].querySelector('input').value.trim();

    // حساب عدد الأصناف
    let productCount = 0;
    if (cartons > 0) productCount++;
    if (bags > 0) productCount++;
    if (size) productCount++;
    if (location) productCount++;

    // تغيير لون الصف بناءً على عدد الأصناف
    if (productCount >= 3) {
        row.style.backgroundColor = '#d4edda'; /* أخضر */
    } else if (productCount === 2) {
        row.style.backgroundColor = '#d1ecf1'; /* أزرق */
    } else if (productCount === 1) {
        row.style.backgroundColor = '#fff3cd'; /* برتقالي */
    } else {
        row.style.backgroundColor = '#f8d7da'; /* أحمر */
    }
}

// تحقق من المخزون وإظهار الإشعارات
function checkInventory() {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    for (let row of table.rows) {
        const cells = row.cells;
        const productName = cells[0].querySelector('input').value;
        const cartons = parseInt(cells[2].querySelector('.quantity-input').value);
        const bags = parseInt(cells[3].querySelector('.quantity-input').value);

        if (cartons === 0 && bags === 0) {
            showNotification(`انتهى المخزون لـ ${productName}`, 'danger');
        } else if (cartons <= 1 || bags <= 1) {
            showNotification(`المخزون على وشك الانتهاء لـ ${productName}`, 'warning');
        }
    }
}

// استدعاء الدالة عند تحميل الصفحة
loadInventory();
checkInventory();