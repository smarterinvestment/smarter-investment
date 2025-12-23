# 🔍 GUÍA: VERIFICAR DUPLICACIÓN DE GASTOS EN FIREBASE

## 🎯 OBJETIVO:
Verificar si los gastos duplicados están en la base de datos de Firebase.

---

## 📋 PASO A PASO:

### 1. Abrir Firebase Console
```
https://console.firebase.google.com
```

### 2. Seleccionar tu Proyecto
- Click en "Smarter Investment" (o como se llame tu proyecto)

### 3. Ir a Firestore Database
- Menú izquierdo → **"Firestore Database"**
- Click en **"Data"** (pestaña superior)

### 4. Buscar Colección de Gastos
Busca una de estas colecciones (depende de cómo lo hayas configurado):
- `expenses`
- `transactions` → campo `type: "expense"`
- `users/{userId}/expenses`

### 5. Verificar Duplicados

#### Método A: Visual (Manual)
```
Mira en la lista si ves:
✅ COMIDA - Alimentación Casa - $135.00 - 22/12/25
✅ COMIDA - Alimentación Casa - $135.00 - 22/12/25  ← DUPLICADO

Si ves el MISMO gasto DOS veces con:
- Misma descripción
- Mismo monto
- Misma fecha
- DIFERENTE ID

= HAY DUPLICADOS EN FIREBASE
```

#### Método B: Consola del Navegador (F12)
```javascript
// Pega esto en consola (F12) de tu app:

// Ver todos los gastos
const db = firebase.firestore();
const expenses = await db.collection('expenses').get();

// Agrupar por descripción + monto + fecha
const grouped = {};
expenses.forEach(doc => {
  const data = doc.data();
  const key = `${data.description}_${data.amount}_${data.date}`;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push({ id: doc.id, ...data });
});

// Mostrar duplicados
Object.entries(grouped).forEach(([key, items]) => {
  if (items.length > 1) {
    console.log('🔴 DUPLICADO:', key);
    console.log('   Cantidad:', items.length);
    console.table(items);
  }
});
```

---

## ❌ SI HAY DUPLICADOS EN FIREBASE:

### Opción A: Eliminar Manualmente (RECOMENDADO)
1. En Firestore Database
2. Busca el gasto duplicado
3. Click en el documento
4. Click botón **"Delete document"**
5. Confirmar
6. Refrescar tu app (F5)

### Opción B: Script para Limpiar (AVANZADO)
```javascript
// ⚠️ PELIGRO: Esto elimina datos
// HAZ BACKUP PRIMERO

// 1. Encuentra duplicados
const db = firebase.firestore();
const expenses = await db.collection('expenses').get();

const seen = new Set();
const toDelete = [];

expenses.forEach(doc => {
  const data = doc.data();
  const key = `${data.description}_${data.amount}_${data.date}`;
  
  if (seen.has(key)) {
    // Es duplicado
    toDelete.push(doc.id);
    console.log('Marcado para eliminar:', doc.id, data.description);
  } else {
    seen.add(key);
  }
});

// 2. Revisa la lista
console.log('Total a eliminar:', toDelete.length);
console.log('IDs:', toDelete);

// 3. Si estás seguro, elimina:
// for (const id of toDelete) {
//   await db.collection('expenses').doc(id).delete();
//   console.log('Eliminado:', id);
// }
```

---

## ✅ SI NO HAY DUPLICADOS EN FIREBASE:

Entonces el problema está en el código:

### 1. Comparte estos archivos:
```
src/hooks/useFirebaseData.ts
src/hooks/useTransactions.ts
src/utils/firebase.ts
```

### 2. En consola (F12), verifica:
```javascript
// Ver cuántos gastos hay en memoria
console.log('Gastos en app:', expenses);
console.log('Cantidad:', expenses.length);

// Ver si son únicos
const unique = new Set(expenses.map(e => e.id));
console.log('IDs únicos:', unique.size);

// Si expenses.length > unique.size:
// = HAY DUPLICADOS EN MEMORIA (problema en código)
```

---

## 🐛 CAUSAS COMUNES DE DUPLICACIÓN:

### En Firebase:
- ✅ Botón submit sin desactivar → Usuario hace doble click
- ✅ Error de red → Transacción se guarda 2 veces
- ✅ Código antiguo que duplicaba

### En Código:
- ✅ Hook suscrito 2 veces al mismo listener
- ✅ Array concatenado consigo mismo: `[...arr, ...arr]`
- ✅ useEffect sin dependencias correctas

---

## 📊 RESULTADO ESPERADO:

Después de verificar Firebase:

### Si HAY duplicados en Firebase:
1. Elimina los duplicados manualmente
2. Refrescar app
3. **Resultado:** Gastos aparecen 1 sola vez ✅

### Si NO hay duplicados en Firebase:
1. El problema está en el hook o componente
2. Comparte archivos mencionados
3. Corrijo el código

---

## ⚠️ IMPORTANTE:

**ANTES de eliminar nada:**
1. Exporta backup de Firestore
2. O screenshot de los datos
3. Por si acaso

**Exportar backup:**
```bash
# En Firebase Console:
Project Settings → Service accounts → 
Generate new private key → Guardar JSON

# Luego:
gcloud firestore export gs://[BUCKET_NAME]/backup
```

---

## 🎯 RESUMEN:

1. ✅ Abre Firebase Console
2. ✅ Busca colección `expenses`
3. ✅ Cuenta duplicados visualmente
4. ✅ Si hay duplicados → Elimina en Firebase
5. ✅ Si NO hay duplicados → Comparte archivos del hook

---

**Cualquier duda, comparte screenshot de Firebase!** 📸
